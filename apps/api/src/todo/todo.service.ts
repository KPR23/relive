import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTodoInput, Todo } from './todo.schema';

@Injectable()
export class TodoService {
  private todos: Todo[] = [];

  createTodo(todoData: CreateTodoInput): Todo {
    const newTodo: Todo = {
      id: Date.now().toString(),
      ...todoData,
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  getTodoById(id: string): Todo {
    const todo = this.todos.find((todo) => todo.id === id);
    if (!todo) throw new NotFoundException(`Todo with id ${id} not found`);
    return todo;
  }

  getAllTodos(): Todo[] {
    return this.todos;
  }

  updateTodo(id: string, data: Partial<CreateTodoInput>): Todo {
    const todo = this.getTodoById(id);
    Object.assign(todo, data);
    return todo;
  }

  deleteTodo(id: string): boolean {
    const todoIndex = this.todos.findIndex((todo) => todo.id === id);
    if (todoIndex === -1)
      throw new NotFoundException(`Todo with id ${id} not found`);
    this.todos.splice(todoIndex, 1);
    return true;
  }
}
