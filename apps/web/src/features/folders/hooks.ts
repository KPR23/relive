'use client';

import { trpc } from '@/src/trpc/client';

export function useRootFolder() {
  return trpc.folder.getRootFolder.useQuery();
}

export function useFolders() {
  return trpc.folder.getAllFolders.useQuery();
}

export function useCreateFolder() {
  const utils = trpc.useUtils();
  return trpc.folder.createFolder.useMutation({
    onSuccess: () => {
      utils.folder.invalidate();
    },
  });
}

export function useDeleteFolder() {
  const utils = trpc.useUtils();
  return trpc.folder.deleteFolder.useMutation({
    onSuccess: () => {
      utils.folder.invalidate();
    },
  });
}
