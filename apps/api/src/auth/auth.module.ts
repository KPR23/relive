import { Module } from '@nestjs/common';
import { AuthMiddleware } from './middleware.js';

@Module({
  providers: [AuthMiddleware],
  exports: [AuthMiddleware],
})
export class AuthMiddlewareModule {}
