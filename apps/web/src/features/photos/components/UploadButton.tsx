'use client';

import { useState } from 'react';
import { usePhotoUploadActions, useUploadProgress } from '../hooks';
import { startUpload } from '../upload';

export function UploadButton({ folderId }: { folderId: string }) {
  const { requestUpload, confirmUpload, utils } = usePhotoUploadActions();
  const { progress, getProgressCallback, reset } = useUploadProgress();

  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const photos = Array.from(e.target.files ?? []);
    if (photos.length === 0) return;

    reset(photos.length);
    setUploading(true);

    try {
      await Promise.allSettled(
        photos.map((photo, index) =>
          startUpload({
            photo,
            folderId,
            requestUpload,
            confirmUpload,
            utils,
            onProgress: getProgressCallback(index, photos.length),
          }),
        ),
      );
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        className="m-4 cursor-pointer rounded-lg bg-amber-600 p-4"
        disabled={uploading}
        onChange={onFileChange}
      />

      {uploading && (
        <>
          <progress value={progress} max={100} />
        </>
      )}
    </div>
  );
}
