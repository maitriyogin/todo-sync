import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTodos, selectIsTodosStale } from "../../store/todos-slice";
import { checkTodosStale } from "../../middleware/syncMiddleware";

export const useFetchTodos = (ttl?: number) => {
	const dispatch = useDispatch();
	const isStale = useSelector(selectIsTodosStale);

	useEffect(() => {
		// Initial fetch with optional TTL
		dispatch(
			fetchTodos({
				loading: true,
				...(ttl && { ttl }), // Set custom TTL if provided
			}),
		);
	}, [dispatch, ttl]);

	// Return function to check if data needs refresh
	const checkAndRefresh = () => {
		dispatch(checkTodosStale());
	};

	return { isStale, checkAndRefresh };
};
