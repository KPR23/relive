'use client';

import { trpc } from '@/src/trpc/client';

export type PhotoUploadActions = {
  requestUpload: ReturnType<typeof trpc.photo.requestUpload.useMutation>;
  confirmUpload: ReturnType<typeof trpc.photo.confirmUpload.useMutation>;
  utils: ReturnType<typeof trpc.useUtils>;
};

export function usePhotos(folderId: string) {
  return trpc.photo.listPhotosForFolder.useQuery(
    { folderId },
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    },
  );
}

export function usePhotoUrl(photoId: string) {
  return trpc.photo.getPhotoUrl.useQuery(
    { photoId },
    {
      staleTime: 60_000,
    },
  );
}

export function usePhotoUploadActions(): PhotoUploadActions {
  const requestUpload = trpc.photo.requestUpload.useMutation();
  const confirmUpload = trpc.photo.confirmUpload.useMutation();
  const utils = trpc.useUtils();

  return {
    requestUpload,
    confirmUpload,
    utils,
  };
}
