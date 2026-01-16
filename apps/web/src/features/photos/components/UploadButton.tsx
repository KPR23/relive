'use client';

import { useState } from 'react';
import { usePhotoUploadActions } from '../hooks';
import { startUpload } from '../upload';

export function UploadButton({ folderId }: { folderId: string }) {
  const { requestUpload, confirmUpload, utils } = usePhotoUploadActions();

  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(0);

    try {
      await startUpload({
        photo: file,
        folderId,
        requestUpload,
        confirmUpload,
        utils,
        onProgress: setProgress,
      });
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" disabled={uploading} onChange={onFileChange} />

      {uploading && (
        <>
          <progress value={progress} max={100} />
        </>
      )}
    </div>
  );
}
