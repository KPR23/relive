'use client';

import { createAppMutation } from '@/src/lib/create-app-mutation';
import { usePhotoUtils } from '@/src/lib/trpc-utils';
import { trpc } from '@/src/trpc/client';

export function useListFolderShareLinks(folderId: string) {
  return trpc.share.listFolderShareLinks.useQuery(
    { folderId },
    { enabled: !!folderId },
  );
}

export function useListPhotoShareLinks(photoId: string) {
  return trpc.share.listPhotoShareLinks.useQuery(
    { photoId },
    { enabled: !!photoId },
  );
}

export function useRevokeShareLink() {
  const utils = usePhotoUtils();
  return trpc.share.revokeShareLink.useMutation(
    createAppMutation({
      successMessage: 'Link revoked',
      invalidate: async () => {
        await utils.share?.invalidate();
      },
    }),
  );
}

export function useCreatePhotoShareLink() {
  const utils = usePhotoUtils();
  return trpc.share.createPhotoShareLink.useMutation(
    createAppMutation({
      successMessage: 'Photo link created',
      invalidate: async () => {
        await utils.share?.invalidate();
      },
    }),
  );
}

export function useCreateFolderShareLink() {
  const utils = usePhotoUtils();
  return trpc.share.createFolderShareLink.useMutation(
    createAppMutation({
      successMessage: 'Folder link created',
      invalidate: async () => {
        await utils.share?.invalidate();
      },
    }),
  );
}

export function useGetSharedContent(token: string, password?: string) {
  return trpc.share.getSharedContent.useQuery(
    { token, password: password || undefined },
    {
      enabled: !!token,
      retry: false,
      staleTime: 0,
    },
  );
}
