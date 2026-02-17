'use client';

import { usePhotoUtils } from '@/src/lib/trpc-utils';
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

export function useAllPhotos() {
  return trpc.photo.listAllPhotos.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
}

export function useSharedPhotosWithMe() {
  return trpc.photo.sharedPhotosWithMe.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });
}

export function useSharePhotoWithUser() {
  return trpc.photo.sharePhotoWithUser.useMutation();
}

export function usePhotoUrl(photoId: string, options?: { enabled?: boolean }) {
  return trpc.photo.getPhotoUrl.useQuery(
    { photoId },
    {
      staleTime: 80_000,
      enabled: options?.enabled ?? true,
      retry: false,
    },
  );
}

export function usePhotoUploadActions(): PhotoUploadActions {
  const utils = usePhotoUtils();
  const requestUpload = trpc.photo.requestUpload.useMutation();
  const confirmUpload = trpc.photo.confirmUpload.useMutation();

  return {
    requestUpload,
    confirmUpload,
    utils,
  };
}

export function useMovePhotoToFolder() {
  const utils = usePhotoUtils();
  return trpc.photo.movePhotoToFolder.useMutation({
    onSuccess: () => {
      utils.photo.invalidate();
    },
  });
}

export function useRemovePhoto() {
  const utils = usePhotoUtils();
  return trpc.photo.removePhoto.useMutation({
    onMutate: async () => {
      await utils.photo.getPhotoUrl.cancel();
    },
    onSuccess: async () => {
      await utils.photo.listAllPhotos.invalidate();
      await utils.photo.listPhotosForFolder.invalidate();
    },
  });
}

export function useRemovePhotoFromFolder() {
  const utils = usePhotoUtils();
  return trpc.photo.removePhotoFromFolder.useMutation({
    onSuccess: () => {
      utils.photo.invalidate();
    },
  });
}
