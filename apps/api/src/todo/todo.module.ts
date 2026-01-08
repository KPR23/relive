import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoRouter } from './todo.router';

@Module({
  providers: [TodoService, TodoRouter],
})
export class TodoModule {}
