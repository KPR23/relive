'use client';

import { createAppMutation } from '@/src/lib/create-app-mutation';
import { usePhotoUtils } from '@/src/lib/trpc-utils';
import { trpc } from '@/src/trpc/client';
import { useCallback, useRef, useState } from 'react';

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
      retry: false,
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
  const utils = usePhotoUtils();

  return trpc.photo.sharePhotoWithUser.useMutation(
    createAppMutation({
      successMessage: 'Photo shared successfully!',
      invalidate: async () => {
        await Promise.all([
          utils.photo.sharedPhotosWithMe.invalidate(),
          utils.photo.listPhotoShares.invalidate(),
        ]);
      },
    }),
  );
}

export function useSharedWith(photoId: string) {
  return trpc.photo.listPhotoShares.useQuery({ photoId });
}

export function useRevokePhotoShare() {
  const utils = usePhotoUtils();

  return trpc.photo.revokePhotoShare.useMutation(
    createAppMutation({
      successMessage: 'Photo share revoked successfully!',
      invalidate: async () => {
        await utils.photo.listPhotoShares.invalidate();
      },
    }),
  );
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

  const requestUpload =
    trpc.photo.requestUpload.useMutation(createAppMutation());

  const confirmUpload = trpc.photo.confirmUpload.useMutation(
    createAppMutation({
      successMessage: 'Upload completed',
      invalidate: async () => {
        await utils.photo.invalidate();
      },
    }),
  );

  return {
    requestUpload,
    confirmUpload,
    utils,
  };
}

export function useMovePhotoToFolder() {
  const utils = usePhotoUtils();

  return trpc.photo.movePhotoToFolder.useMutation(
    createAppMutation({
      successMessage: 'Photo moved successfully!',
      invalidate: async () => {
        await utils.photo.invalidate();
      },
    }),
  );
}

export function useRemovePhoto() {
  const utils = usePhotoUtils();

  return trpc.photo.removePhoto.useMutation({
    ...createAppMutation({
      successMessage: 'Photo deleted',
      invalidate: async () => {
        await Promise.all([
          utils.photo.listAllPhotos.invalidate(),
          utils.photo.listPhotosForFolder.invalidate(),
        ]);
      },
    }),
    onMutate: async () => {
      await utils.photo.getPhotoUrl.cancel();
    },
  });
}

export function useRemovePhotoFromFolder() {
  const utils = usePhotoUtils();

  return trpc.photo.removePhotoFromFolder.useMutation(
    createAppMutation({
      successMessage: 'Photo removed from folder',
      invalidate: async () => {
        await utils.photo.invalidate();
      },
    }),
  );
}

export function useUploadProgress() {
  const [progress, setProgress] = useState(0);
  const progressByFile = useRef<number[]>([]);

  const getProgressCallback = useCallback(
    (index: number) => (percent: number) => {
      progressByFile.current[index] = percent;
      const total = progressByFile.current.reduce((a, b) => a + b, 0);
      const count = progressByFile.current.length;
      setProgress(count > 0 ? total / count : 0);
    },
    [],
  );

  const reset = useCallback((count: number) => {
    progressByFile.current = new Array(count).fill(0);
    setProgress(0);
  }, []);

  return { progress, getProgressCallback, reset };
}
