import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { syncService } from "../services/syncService";
import { enqueue } from "../store/queueSlice.js";
import { startSync, syncError, syncSuccess } from "../store/syncSlice.js";
import { selectIsTodosStale, fetchTodos, setTTL } from "../store/todos-slice";

const getMarkSyncedAction = (type: string, id: string) => ({
	type: `${type.split("/")[0]}/markSynced`,
	id,
});

// Create the listener middleware instance
export const syncListenerMiddleware = createListenerMiddleware();

// Action to check TTL and refetch if stale
export const checkTodosStale = () => ({
	type: "todos/checkStale",
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

// Listener 1: Handle TTL checks - refetch if data is stale
syncListenerMiddleware.startListening({
	type: "todos/checkStale",
	effect: (action, listenerApi) => {
		const state = listenerApi.getState();
		const isStale = selectIsTodosStale(state);

		if (isStale) {
			console.log("[TTL] Todos data is stale, refetching...");
			listenerApi.dispatch(fetchTodos({ loading: true }));
		} else {
			console.log("[TTL] Todos data is fresh");
		}
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

		// Handle TTL if specified - update the TTL value
		if (action.payload.ttl !== undefined) {
			listenerApi.dispatch(setTTL(action.payload.ttl));
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
