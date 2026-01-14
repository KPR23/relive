import { trpc } from '@/src/trpc/client';

type UploadDeps = {
  file: File;
  folderId: string;
  requestUpload: ReturnType<typeof trpc.photo.requestUpload.useMutation>;
  confirmUpload: ReturnType<typeof trpc.photo.confirmUpload.useMutation>;
  utils: ReturnType<typeof trpc.useUtils>;
  onProgress?: (percent: number) => void;
};

export async function startUpload({
  file,
  folderId,
  requestUpload,
  confirmUpload,
  utils,
}: UploadDeps) {
  const { photoId, uploadUrl } = await requestUpload.mutateAsync({
    folderId,
    mimeType: file.type,
    originalName: file.name,
  });

  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage');
  }

  await confirmUpload.mutateAsync({ photoId: photoId });

  await utils.photo.listPhotos.invalidate({ folderId });
}
