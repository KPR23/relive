import { Module } from '@nestjs/common';
import { TrpcModule } from './trpc/trpc.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [TrpcModule, TodoModule],
})
export class AppModule {}
