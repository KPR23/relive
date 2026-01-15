'use client';

import { PhotoFile, RequestUploadInput } from '../types';
import { PhotoUploadActions } from './hooks';

type UploadDeps = PhotoUploadActions & {
  photo: File;
  folderId: string;
  onProgress?: (percent: number) => void;
};

export async function startUpload({
  photo,
  folderId,
  requestUpload,
  confirmUpload,
  utils,
}: UploadDeps) {
  const input: RequestUploadInput = {
    folderId,
    mimeType: photo.type,
    originalName: photo.name,
  };

  const { photoId, uploadUrl } = await requestUpload.mutateAsync(input);

  const uploadInfo: PhotoFile = {
    ...input,
    photoId,
    uploadUrl,
  };

  const response = await fetch(uploadInfo.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': uploadInfo.mimeType },
    body: photo,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file to storage');
  }

  await confirmUpload.mutateAsync({ photoId: uploadInfo.photoId });

  await utils.photo.listPhotos.invalidate({ folderId });
}
