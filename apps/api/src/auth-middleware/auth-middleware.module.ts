import { Module } from '@nestjs/common';
import { AuthMiddleware } from '../auth/middleware.js';

@Module({
  providers: [AuthMiddleware],
  exports: [AuthMiddleware],
})
export class AuthMiddlewareModule {}
