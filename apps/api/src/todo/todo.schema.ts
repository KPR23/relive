import z from 'zod';

export const todoSchema = z.object({
  id: z.string(),
  name: z.string(),
  completed: z.boolean(),
});

export const createTodoSchema = todoSchema.omit({ id: true });

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type Todo = z.infer<typeof todoSchema>;
