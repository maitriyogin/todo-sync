import { useFetchTodos } from "./api/hooks/useFetchTodos";

export const useFetchEverything = () => {
	// this hook will fetch all data that is then fetched via redux selectors
	// fetch todos
	// fetch activities
	// fetch user
	useFetchTodos(false, 3000);
};
