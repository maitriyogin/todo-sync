import { configureStore } from "@reduxjs/toolkit";
import { syncMiddleware } from "../middleware/syncMiddleware";
import networkReducer from "./networkSlice.js";
import queueReducer from "./queueSlice.js";
import syncReducer from "./syncSlice";
import { todosReducer } from "./todos-slice";

const PERSIST_KEY = "redux-sync-engine-state-v1";

// Cookie helpers
function getPersistedState() {
	try {
		const match = document.cookie.match(
			new RegExp(`(?:^|; )${PERSIST_KEY}=([^;]*)`),
		);
		if (!match) return undefined;
		return JSON.parse(decodeURIComponent(match[1]));
	} catch (e) {
		console.warn("Failed to load persisted state from cookie", e);
		return undefined;
	}
}

function setPersistedState(state: any) {
	try {
		const value = encodeURIComponent(JSON.stringify(state));
		document.cookie = `${PERSIST_KEY}=${value}; path=/; max-age=31536000`; // 1 year
	} catch (e) {
		console.warn("Failed to persist state to cookie", e);
	}
}

export async function createStoreWithPreload() {
	const preloadedState = await getPersistedState();

	const store = configureStore({
		preloadedState,
		reducer: {
			queue: queueReducer,
			sync: syncReducer,
			network: networkReducer,
			todos: todosReducer,
		},
		middleware: (getDefaultMiddleware) =>
			getDefaultMiddleware().concat(syncMiddleware),
	});

	store.subscribe(() => {
		const state = store.getState();
		if (!state.network.pageLoaded) return;
		const toPersist = {
			todos: state.todos,
			queue: state.queue,
		};
		setPersistedState(toPersist);
	});

	return store;
}

// Network listener helpers
export function startNetworkListener(store: ReturnType<typeof configureStore>) {
	function update() {
		store.dispatch({ type: "network/setOnline", payload: navigator.onLine });
		if (navigator.onLine) {
			store.dispatch({ type: "queue/process" });
		}
	}

	function load() {
		store.dispatch({ type: "network/setPageLoaded", payload: true });
		if (navigator.onLine) {
			store.dispatch({ type: "queue/process" });
		}
	}
	window.addEventListener("online", update);
	window.addEventListener("offline", update);
	window.addEventListener("load", load);
	store.dispatch({ type: "network/setOnline", payload: navigator.onLine });
}
