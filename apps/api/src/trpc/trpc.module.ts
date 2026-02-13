import { Module } from '@nestjs/common';
import { TRPCModule } from 'nestjs-trpc';
import { TRPCError } from '@trpc/server';
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

function isZodError(cause: unknown): cause is ZodError {
  return cause instanceof ZodError;
}

@Module({
  imports: [
    TRPCModule.forRoot({
      ...(isProduction
        ? {}
        : { autoSchemaFile: '../../packages/trpc/src/server' }),
      basePath: '/api/trpc',
      context: AppContext,
      errorFormatter(opts: {
        shape: { message: string; data: object };
        error: TRPCError;
      }) {
        const { shape, error } = opts;
        if (error.code === 'BAD_REQUEST' && isZodError(error.cause)) {
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
