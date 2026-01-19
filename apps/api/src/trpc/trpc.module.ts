import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { AppContext } from './context.js';
import { env } from '../env.server.js';

const isProduction = env.NODE_ENV === 'production';
@Module({
  imports: [
    TRPCModule.forRoot({
      ...(isProduction
        ? {}
        : { autoSchemaFile: '../../packages/trpc/src/server' }),
      basePath: '/api/trpc',
      context: AppContext,
    }),
  ],
  providers: [AppContext],
})
export class TrpcModule {}
