'use client';

import { createAppMutation } from '@/src/lib/create-app-mutation';
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
  return trpc.folder.getAllParentsForFolder.useQuery(
    {
      folderId,
    },
    {
      retry: false,
    },
  );
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
  return trpc.folder.createFolder.useMutation(
    createAppMutation({
      successMessage: 'Folder created successfully!',
      invalidate: async () => {
        await utils.folder.invalidate();
      },
    }),
  );
}

export function useDeleteFolder() {
  const utils = usePhotoUtils();
  return trpc.folder.deleteFolder.useMutation(
    createAppMutation({
      successMessage: 'Folder deleted successfully!',
      invalidate: async () => {
        await utils.folder.invalidate();
      },
    }),
  );
}

export function useShareFolderWithUser() {
  const utils = usePhotoUtils();
  return trpc.folder.shareFolderWithUser.useMutation(
    createAppMutation({
      successMessage: 'Folder shared successfully!',
      invalidate: async () => {
        await Promise.all([
          utils.folder.invalidate(),
          utils.folder.listSharedFoldersWithMe.invalidate(),
        ]);
      },
    }),
  );
}

export function useListFolderShares(folderId: string) {
  return trpc.folder.listFolderShares.useQuery({ folderId });
}

export function useListSharedFoldersWithMe() {
  return trpc.folder.listSharedFoldersWithMe.useQuery();
}
