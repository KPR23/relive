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
