import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import App from "./App.tsx";
import { createStoreWithPreload, startNetworkListener } from "./store/store";

createStoreWithPreload().then((store) => {
	startNetworkListener(store);
	createRoot(document.getElementById("root")!).render(
		<Provider store={store}>
			<App />
		</Provider>,
	);
});
