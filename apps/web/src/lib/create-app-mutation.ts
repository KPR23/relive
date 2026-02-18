'use client';

import { toast } from 'sonner';
import { getTRPCErrorMessage } from './trpc-error';

type Options = {
  successMessage?: string;
  invalidate?: () => void | Promise<void>;
  onSuccess?: () => void | Promise<void>;
};

export function createAppMutation(options?: Options) {
  return {
    onSuccess: async () => {
      if (options?.invalidate) {
        await options.invalidate();
      }

      if (options?.onSuccess) {
        await options.onSuccess();
      }

      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
    },
    onError: (error: unknown) => {
      toast.error(getTRPCErrorMessage(error));
    },
  };
}
