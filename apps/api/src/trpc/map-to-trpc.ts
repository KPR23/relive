import { HttpException } from '@nestjs/common';
import { TRPCError } from '@trpc/server';
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
import { AppError } from '../helpers/errors.js';

export function mapToTRPCError(err: unknown): never {
  if (err instanceof AppError) {
    throw new TRPCError({
      code: err.code,
      message: err.message,
      cause: err.cause,
    });
  }

  if (err instanceof TRPCError) {
    throw err;
  }

  if (err instanceof HttpException) {
    const status = err.getStatus();
    throw new TRPCError({
      code: mapHttpStatusToTRPC(status),
      message: getHttpMessage(err),
    });
  }

  console.error('[Unhandled Error]:', err);
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    cause: err,
  });
}

function mapHttpStatusToTRPC(status: number): TRPC_ERROR_CODE_KEY {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 403) return 'FORBIDDEN';
  if (status === 409) return 'CONFLICT';
  if (status === 400) return 'BAD_REQUEST';
  return 'INTERNAL_SERVER_ERROR';
}

function getHttpMessage(err: HttpException): string {
  const response = err.getResponse();

  if (typeof response === 'string') return response;

  if (
    typeof response === 'object' &&
    response !== null &&
    'message' in response
  ) {
    const msg = (response as Record<string, unknown>).message;

    if (Array.isArray(msg)) {
      return msg.join(', ');
    }

    if (typeof msg === 'string') {
      return msg;
    }
  }

  return err.message;
}
