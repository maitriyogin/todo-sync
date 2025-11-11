import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import {
	AddTodoDocument,
	DeleteTodoDocument,
	TodosQueryDocument,
	ToggleTodoDocument,
} from "../api/generated";
import type { RootState } from "./types";

interface ITodo {
	id: string;
	title: string;
	completed?: boolean;
	synced?: boolean;
}

// Define a type for the slice state
interface TodosState {
	todos: ITodo[];
	loading: boolean;
	lastFetched: number | null; // Timestamp when data was last fetched
	ttl: number; // Time-to-live in milliseconds
}

// Define the initial state using that type
const initialState: TodosState = {
	loading: false,
	todos: [],
	lastFetched: null,
	ttl: 30000, // Default: 30 seconds
};

export const todosSlice = createSlice({
	name: "todos",
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	reducers: {
		/*
		  1. Immediate UI update - The todo appears instantly in the list with a temporary ID (lines 36 in todos-slice.ts and 28 in Todos.tsx)
		  2. Background sync - The request is sent to the server via the sync middleware
		  3. Server confirmation - When the server responds, the updateTodo reducer will update the todo with the server-generated ID
		 */
		addTodo: (state, action: PayloadAction<{ todo: ITodo }>) => {
			state.loading = true;
			state.todos = [...state.todos, action.payload.todo];
		},
		removeTodo: (
			state,
			action: PayloadAction<{ id: string; clientId: string }>,
		) => {
			console.log("removeTodo", action.payload);
			state.loading = true;
			state.todos = state.todos.filter(
				(t) =>
					t.id !== action.payload.id && t.clientId !== action.payload.clientId,
			);
		},
		updateTodo: (
			state,
			action: PayloadAction<{
				todo?: ITodo;
				toggleTodo?: ITodo;
				addTodo?: ITodo;
				synch: true;
			}>,
		) => {
			const todo =
				action.payload.todo ??
				action.payload.toggleTodo ??
				action.payload.addTodo;
			if (!todo) return;
			const i = state.todos.findIndex(
				(t) => t.id === todo?.id && t.clientId !== action.payload.clientId,
			);
			if (i >= 0) {
				state.todos[i] = { ...state.todos[i], ...todo };
			} else if (action.payload.addTodo) {
				// Add new todo from server response
				state.todos = [...state.todos, action.payload.addTodo];
			}
			state.loading = false;
		},
		fetchTodos: (state) => {
			state.loading = true;
		},
		fetchTodosSuccess: (state, action: PayloadAction<{ todos?: ITodo[] }>) => {
			state.todos = action.payload.todos ?? [];
			state.loading = false;
			state.lastFetched = Date.now();
		},
		setTTL: (state, action: PayloadAction<number>) => {
			state.ttl = action.payload;
		},
		toggleTodo: (state, action: PayloadAction<{ id: string }>) => {
			const i = state.todos.findIndex((t) => t.id === action.payload.id);
			if (i >= 0)
				state.todos[i] = {
					...state.todos[i],
					completed: !state.todos[i].completed,
				};
		},
		markSynced: (state, action) => {
			const id = action.payload;
			const it = state.todos.find((i) => i.id === id);
			if (it) it.synced = true;
		},
	},
});

export const { fetchTodosSuccess, setTTL } = todosSlice.actions;

export const fetchTodos = (payload) =>
	todosSlice.actions.fetchTodos({
		...payload,
		sync: true,
		start: { type: "todos/fetchTodosStart", payload: undefined },
		success: { type: "todos/fetchTodosSuccess", payload: undefined },
		variables: {},
		query: TodosQueryDocument,
		ttl: payload?.ttl, // Optional TTL in milliseconds
	});

export const toggleTodo = (payload) =>
	payload.id &&
	todosSlice.actions.toggleTodo({
		...payload,
		sync: true,
		polling: 10,
		success: {
			type: "todos/updateTodo",
			payload: { client: payload.clientId },
		},
		variables: { id: payload.id },
		query: ToggleTodoDocument,
	});

export const addTodo = (payload) =>
	todosSlice.actions.addTodo({
		todo: payload.todo,
		sync: true,
		success: {
			type: "todos/updateTodo",
			payload: { client: payload.clientId },
		},
		variables: { title: payload.todo.title, clientId: payload.todo.clientId },
		query: AddTodoDocument,
	});

export const removeTodo = (payload) =>
	payload.id &&
	todosSlice.actions.removeTodo({
		id: payload.id,
		sync: true,
		success: {
			type: "todos/updateTodo",
			payload: { client: payload.clientId },
		},
		variables: { id: payload.id },
		query: DeleteTodoDocument,
	});

// Other code such as selectors can use the imported `RootState` type
export const selectTodos = (state: RootState) => state.todos;

// Check if todos data is stale (TTL expired)
export const selectIsTodosStale = (state: RootState) => {
	const { lastFetched, ttl } = state.todos;
	if (lastFetched === null) return true; // Never fetched
	return Date.now() - lastFetched > ttl;
};

export const todosReducer = todosSlice.reducer;

// // --- THUNKS
// export const fetchTodos = () => {
// 	// fetchTodoByIdThunk is the "thunk function"
// 	return async function fetchTodos(dispatch, getState) {
// 		const response = await client.request<{ todos?: Todo[] }>(
// 			TodosQueryDocument,
// 		);
// 		dispatch(todosLoaded(response));
// 	};
// };
