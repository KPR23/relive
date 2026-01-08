import { Input, Mutation, Query, Router } from 'nestjs-trpc';
import { TodoService } from './todo.service';
import z from 'zod';
import {
  type CreateTodoInput,
  createTodoSchema,
  todoSchema,
} from './todo.schema';

@Router({ alias: 'todo' })
export class TodoRouter {
  constructor(private readonly todoService: TodoService) {}

  @Query({ input: z.object({ id: z.string() }), output: todoSchema })
  getTodoById(@Input('id') id: string) {
    return this.todoService.getTodoById(id);
  }

  @Query({ output: z.array(todoSchema) })
  getAllTodos() {
    return this.todoService.getAllTodos();
  }

  @Mutation({ input: createTodoSchema, output: todoSchema })
  createTodo(@Input() todoData: CreateTodoInput) {
    return this.todoService.createTodo(todoData);
  }

  @Mutation({
    input: z.object({ id: z.string(), data: createTodoSchema.partial() }),
    output: todoSchema,
  })
  updateTodo(
    @Input('id') id: string,
    @Input('data') data: Partial<CreateTodoInput>,
  ) {
    return this.todoService.updateTodo(id, data);
  }

  @Mutation({ input: z.object({ id: z.string() }), output: z.boolean() })
  deleteTodo(@Input('id') id: string) {
    return this.todoService.deleteTodo(id);
  }
}
