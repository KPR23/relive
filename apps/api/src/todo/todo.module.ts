import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoRouter } from './todo.router';
import { AuthMiddleware } from '../middleware';

@Module({
  providers: [TodoService, TodoRouter, AuthMiddleware],
})
export class TodoModule {}
