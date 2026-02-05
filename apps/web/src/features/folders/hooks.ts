'use client';

import { usePhotoUtils } from '@/src/lib/trpc-utils';
import { trpc } from '@/src/trpc/client';

export function useRootFolder(
  options: { enabled?: boolean; staleTime?: number } = {},
) {
  return trpc.folder.getRootFolder.useQuery(undefined, {
    staleTime: Infinity,
    ...options,
  });
}

export function useFolders() {
  return trpc.folder.getAllFolders.useQuery();
}

export function useFoldersByParentId(parentId: string) {
  return trpc.folder.getFolderChildren.useQuery({
    parentId,
  });
}

export function useAllParentsForFolder(folderId: string) {
  return trpc.folder.getAllParentsForFolder.useQuery({
    folderId,
  });
}

export function useMoveableFolders(
  currentFolderId?: string,
  options?: { enabled?: boolean },
) {
  return trpc.folder.getMoveableFolders.useQuery(
    { currentFolderId: currentFolderId },
    {
      staleTime: 0,
      ...options,
    },
  );
}

export function useCreateFolder() {
  const utils = usePhotoUtils();
  return trpc.folder.createFolder.useMutation({
    onSuccess: () => {
      utils.folder.invalidate();
    },
  });
}

export function useDeleteFolder() {
  const utils = usePhotoUtils();
  return trpc.folder.deleteFolder.useMutation({
    onSuccess: () => {
      utils.folder.invalidate();
    },
  });
}
