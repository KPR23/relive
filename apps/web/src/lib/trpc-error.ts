'use client';

import { TRPCClientError } from '@trpc/client';

export function getTRPCErrorMessage(error: unknown): string {
  if (error instanceof TRPCClientError) {
    const code = error.data?.code;

    switch (code) {
      case 'UNAUTHORIZED':
        return 'You must be logged in';

      case 'FORBIDDEN':
        return (
          error.message || 'You do not have permission to perform this action'
        );

      case 'INTERNAL_SERVER_ERROR':
        return 'Server error. Please try again later.';

      default:
        return error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
