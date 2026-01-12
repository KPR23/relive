import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TrpcModule } from './trpc/trpc.module';
import { TodoModule } from './todo/todo.module';
import { auth } from './auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TrpcModule,
    TodoModule,
    AuthModule.forRoot({ auth }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
