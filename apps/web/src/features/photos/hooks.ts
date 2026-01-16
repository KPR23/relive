'use client';

import { trpc } from '@/src/trpc/client';

export type PhotoUploadActions = {
  requestUpload: ReturnType<typeof trpc.photo.requestUpload.useMutation>;
  confirmUpload: ReturnType<typeof trpc.photo.confirmUpload.useMutation>;
  utils: ReturnType<typeof trpc.useUtils>;
};

export function usePhotos(folderId: string) {
  return trpc.photo.listPhotos.useQuery(
    { folderId },
    {
      staleTime: 60_000,
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

export function useThumbnailUrl(photoId: string) {
  return trpc.photo.getThumbnailUrl.useQuery(
    { photoId },
    {
      staleTime: 60_000,
    },
  );
}

export function useFolderThumbnailUrls(folderId: string) {
  return trpc.photo.getFolderThumbnailUrls.useQuery({ folderId });
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
