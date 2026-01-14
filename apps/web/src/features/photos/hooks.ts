'use client';

import { trpc } from '@/src/trpc/client';

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

export function usePhotoUploadActions(): {
  requestUpload: ReturnType<typeof trpc.photo.requestUpload.useMutation>;
  confirmUpload: ReturnType<typeof trpc.photo.confirmUpload.useMutation>;
  utils: ReturnType<typeof trpc.useUtils>;
} {
  const requestUpload = trpc.photo.requestUpload.useMutation();
  const confirmUpload = trpc.photo.confirmUpload.useMutation();
  const utils = trpc.useUtils();

  return {
    requestUpload,
    confirmUpload,
    utils,
  };
}
