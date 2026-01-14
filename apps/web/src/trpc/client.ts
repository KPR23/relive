import {
  createTRPCReact,
  CreateTRPCReact,
  httpBatchLink,
} from '@trpc/react-query';
import { AppRouter } from '@repo/trpc/router';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { QueryClient } from '@tanstack/react-query';

export const trpc: CreateTRPCReact<AppRouter, object, object> = createTRPCReact<
  AppRouter,
  object
>();

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;
export function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: 'include',
        });
      },
    }),
  ],
});
