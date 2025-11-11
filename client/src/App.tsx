import "./App.css";
import OfflineIndicator from "./components/OfflineIndicator";
import { TodosContainer } from "./TodosContainer";
import { useFetchEverything } from "./useFetchEverything";

function App() {
	useFetchEverything();
	return (
		<>
			<OfflineIndicator />
			<TodosContainer />
		</>
	);
}

export default App;
