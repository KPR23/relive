'use client';

import { usePhotoUploadActions } from '../hooks';
import { startUpload } from '../upload';

export function UploadButton({ folderId }: { folderId: string }) {
  const { requestUpload, confirmUpload, utils } = usePhotoUploadActions();

  const onFileSelected = async (file: File) => {
    await startUpload({
      file,
      folderId,
      requestUpload,
      confirmUpload,
      utils,
    });
  };

  return (
    <input
      type="file"
      className="m-4 border border-dashed border-gray-500 p-2"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          onFileSelected(file);
        }
      }}
    />
  );
}
