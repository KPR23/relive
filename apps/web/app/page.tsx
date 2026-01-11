"use client";

import { trpc } from "../trpc/client";

export default function Home() {
	const { data } = trpc.todo.getAllTodos.useQuery();
	// const mutation = trpc.todo.createTodo.useMutation({
	// 	onSuccess: () => {},
	// });
	// console.log(data);
	return data?.map((todo) => <div key={todo.id}>{todo.name}</div>);
}
