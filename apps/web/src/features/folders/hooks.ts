import { trpc } from '@/src/trpc/client';

export function useRootFolder() {
  return trpc.folder.getRootFolder.useQuery();
}
