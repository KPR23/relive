import { trpc } from '../trpc/client';

export function usePhotoUtils(): ReturnType<typeof trpc.useUtils> {
  return trpc.useUtils();
}
