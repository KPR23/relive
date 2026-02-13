import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { ZodError, flattenError } from 'zod';
import { AppContext } from './context.js';
import { env } from '../env.server.js';

const isProduction = env.NODE_ENV === 'production';

function formatZodMessage(zodError: ZodError): string {
  const flattened = flattenError(zodError);
  const fieldErrors = flattened.fieldErrors as Record<string, string[]>;
  const messages = Object.values(fieldErrors).flat().filter(Boolean);
  return messages.length > 0 ? messages.join('; ') : zodError.message;
}

@Module({
  imports: [
    TRPCModule.forRoot({
      ...(isProduction
        ? {}
        : { autoSchemaFile: '../../packages/trpc/src/server' }),
      basePath: '/api/trpc',
      context: AppContext,
      errorFormatter({ shape, error }) {
        if (error.code === 'BAD_REQUEST' && error.cause instanceof ZodError) {
          const zodError = error.cause;
          return {
            ...shape,
            message: formatZodMessage(zodError),
            data: {
              ...shape.data,
              zodError: flattenError(zodError),
            },
          };
        }
        return shape;
      },
    }),
  ],
  providers: [AppContext],
})
export class TrpcModule {}
