import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFetchTodos } from "./api/hooks/useFetchTodos";
import {
	addTodo,
	removeTodo,
	selectTodos,
	toggleTodo,
} from "./store/todos-slice";

export const TodosContainer = () => {
	useFetchTodos(false, 3000);

	const { todos } = useSelector(selectTodos);
	const dispatch = useDispatch();
	const [newTodoTitle, setNewTodoTitle] = useState("");

	const handleComplete = (id) => {
		dispatch(toggleTodo({ id }));
	};

	const handleRemove = (id, clientId) => {
		dispatch(removeTodo({ id, clientId }));
	};

	const handleAddTodo = (e) => {
		e.preventDefault();
		if (newTodoTitle.trim()) {
			dispatch(
				addTodo({
					todo: {
						clientId: Date.now().toString(),
						title: newTodoTitle,
						completed: false,
					},
				}),
			);
			setNewTodoTitle("");
		}
	};
	return (
		<Todos
			todos={todos}
			handleAddTodo={handleAddTodo}
			handleComplete={handleComplete}
			handleRemove={handleRemove}
			newTodoTitle={newTodoTitle}
			setNewTodoTitle={setNewTodoTitle}
		/>
	);
};

export const Todos = ({
	todos,
	handleComplete,
	handleRemove,
	handleAddTodo,
	newTodoTitle,
	setNewTodoTitle,
}) => {
	return (
		<>
			<h1>Todos</h1>
			<div className="card">
				<form onSubmit={handleAddTodo} style={{ marginBottom: "1rem" }}>
					<input
						type="text"
						value={newTodoTitle}
						onChange={(e) => setNewTodoTitle(e.target.value)}
						placeholder="Enter a new todo"
						style={{ marginRight: "0.5rem", padding: "0.5rem" }}
					/>
					{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
					<button type="submit">Add Todo</button>
				</form>
				{todos.map((t) => (
					<ul key={t.id}>
						<li>
							{t.title}
							{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
							<button
								onClick={() => handleComplete(t.id)}
								style={{ marginRight: "0.5rem" }}
							>
								{t.completed ? "Completed" : "Not Completed"}
							</button>
							{/** biome-ignore lint/a11y/useButtonType: <explanation> */}
							<button onClick={() => handleRemove(t.id, t.clientId)}>
								Delete
							</button>
						</li>
					</ul>
				))}
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
};
