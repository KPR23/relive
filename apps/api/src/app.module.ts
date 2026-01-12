import { Module } from '@nestjs/common';
import { TrpcModule } from './trpc/trpc.module';
import { TodoModule } from './todo/todo.module';
import { auth } from './auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { UserModule } from './user/user.module';

@Module({
  imports: [TrpcModule, TodoModule, AuthModule.forRoot({ auth }), UserModule],
})
export class AppModule {}
