import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { AppContext } from './context';

@Module({
  imports: [
    TRPCModule.forRoot({
      autoSchemaFile: '../../packages/trpc/src/server',
      basePath: '/api/trpc',
      context: AppContext,
    }),
  ],
  providers: [AppContext],
})
export class TrpcModule {}
