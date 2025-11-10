import "./App.css";
import OfflineIndicator from "./components/OfflineIndicator";
import { TodosContainer } from "./TodosContainer";

function App() {
	return (
		<>
			<OfflineIndicator />
			<TodosContainer />
		</>
	);
}

export default App;
