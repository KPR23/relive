'use client';

import { PropsWithChildren } from 'react';
import { getQueryClient, trpc, trpcClient } from '../trpc/client';
import { QueryClientProvider } from '@tanstack/react-query';

export default function TRPCProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
