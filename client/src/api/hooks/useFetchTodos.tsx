import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchTodos } from "../../store/todos-slice";
import { stopPollingAction } from "../../middleware/syncMiddleware";

export const useFetchTodos = (enablePolling = false, pollingInterval = 10000) => {
	const dispatch = useDispatch();
	useEffect(() => {
		// Fetch todos with optional polling
		dispatch(
			fetchTodos({
				loading: true,
				// Enable polling by passing: { interval: milliseconds }
				// Disable by not passing the polling property
				...(enablePolling && { polling: { interval: pollingInterval } }),
			}),
		);

		// Cleanup: stop polling when component unmounts
		return () => {
			if (enablePolling) {
				dispatch(stopPollingAction("todos/fetchTodos"));
			}
		};
	}, [dispatch, enablePolling, pollingInterval]);
};
