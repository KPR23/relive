'use client';

import { RequestUploadInput } from '../types';
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
  onProgress,
}: UploadDeps) {
  const input: RequestUploadInput = {
    folderId,
    mimeType: photo.type,
    originalName: photo.name,
  };

  const { photoId, uploadUrl } = await requestUpload.mutateAsync(input);

  await uploadWithProgress(uploadUrl, photo, onProgress);

  await confirmUpload.mutateAsync({ photoId });

  await utils.photo.listPhotos.invalidate({ folderId });
}

function uploadWithProgress(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type);

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const percent = Math.round((event.loaded / event.total) * 100);

      onProgress?.(percent);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed (${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Upload failed'));
    };

    xhr.send(file);
  });
}
