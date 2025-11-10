import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { syncService } from "../services/syncService";
import { enqueue } from "../store/queueSlice.js";
import { startSync, syncError, syncSuccess } from "../store/syncSlice.js";

const getMarkSyncedAction = (type: string, id: string) => ({
	type: `${type.split("/")[0]}/markSynced`,
	id,
});

// Create the listener middleware instance
export const syncListenerMiddleware = createListenerMiddleware();

// Store active polling intervals
const pollingIntervals = new Map<string, NodeJS.Timeout>();

function startPolling(storeAPI, action) {
	const { polling } = action.payload;
	if (!polling || !polling.interval) return;

	const pollKey = action.type;

	// Clear existing interval if any
	if (pollingIntervals.has(pollKey)) {
		clearInterval(pollingIntervals.get(pollKey));
	}

	// Set up new polling interval
	const intervalId = setInterval(() => {
		// Re-dispatch the action without the polling flag to avoid infinite loops
		const pollingAction = {
			...action,
			payload: {
				...action.payload,
				polling: undefined,
			},
		};
		storeAPI.dispatch(pollingAction);
	}, polling.interval);

	pollingIntervals.set(pollKey, intervalId);
}

function stopPolling(actionType: string) {
	if (pollingIntervals.has(actionType)) {
		clearInterval(pollingIntervals.get(actionType));
		pollingIntervals.delete(actionType);
	}
}

// Export action creator to stop polling
export const stopPollingAction = (actionType: string) => ({
	type: "polling/stop",
	payload: { actionType },
});

async function sendOperation(dispatch, op, action) {
	try {
		dispatch(startSync());

		const res = await syncService.send(op);
		// on success, mark todo as synced in todos slice
		console.log("### POLLING", action.type, "res", res);
		dispatch({
			...action.payload.success,
			payload: { ...res, loaded: true },
		});
		dispatch(syncSuccess());
	} catch (err) {
		// If send fails, enqueue operation to retry later
		dispatch(enqueue(op));
		dispatch(
			syncError(err instanceof Error ? err.message : String(err)),
		);
	}
}

// Listener 1: Handle stop polling actions
syncListenerMiddleware.startListening({
	type: "polling/stop",
	effect: (action, listenerApi) => {
		stopPolling(action.payload.actionType);
	},
});

// Listener 2: Handle queue processing
syncListenerMiddleware.startListening({
	type: "queue/process",
	effect: async (action, listenerApi) => {
		await processQueue(listenerApi.dispatch, listenerApi.getState);
	},
});

// Listener 3: Handle syncable actions
syncListenerMiddleware.startListening({
	predicate: (action) => action?.payload?.sync === true,
	effect: async (action, listenerApi) => {
		const state = listenerApi.getState();
		const online = state.network.online;

		// Handle polling if specified
		if (action.payload.polling) {
			startPolling(
				{ dispatch: listenerApi.dispatch, getState: listenerApi.getState },
				action,
			);
		}

		// Build a small op to store in queue or send
		const op = {
			type: action.type,
			payload: action.payload,
			meta: { createdAt: Date.now() },
			query: action.payload.query,
			variables: action.payload.variables,
		};

		if (!online) {
			// enqueue for later
			listenerApi.dispatch(enqueue(op));
			return;
		}

		// online: try sending immediately
		await sendOperation(listenerApi.dispatch, op, action);
	},
});

async function processQueue(dispatch, getState) {
	const state = getState();
	if (!state.queue.items.length) return;
	dispatch(startSync());
	try {
		console.log("####### PROCESS QUEUES", state.queue.items?.length);
		// Process items in order (FIFO)
		for (const op of [...state.queue.items]) {
			const res = await syncService.send(op);
			// mark synced if entity op
			dispatch({
				...op.payload.success,
				clientId: op.payload.variables.clientId,
				payload: res,
			});

			dispatch({ type: "queue/dequeue" });
		}
		dispatch(syncSuccess());
	} catch (err) {
		// keep the remaining items in queue; record error
		dispatch(
			syncError(err instanceof Error ? err.message : String(err)),
		);
	}
}

// Export the middleware to be used in the store
export const syncMiddleware = syncListenerMiddleware.middleware;
