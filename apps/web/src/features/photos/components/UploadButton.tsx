'use client';

import { usePhotoUploadActions } from '../hooks';
import { startUpload } from '../upload';

export function UploadButton({ folderId }: { folderId: string }) {
  const { requestUpload, confirmUpload, utils } = usePhotoUploadActions();

  const onPhotoSelected = async (photo: File) => {
    try {
      await startUpload({
        photo,
        folderId,
        requestUpload,
        confirmUpload,
        utils,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <input
      type="file"
      className="m-4 border border-dashed border-gray-500 p-2"
      onChange={(e) => {
        const photo = e.target.files?.[0];
        if (photo) {
          onPhotoSelected(photo);
        }
      }}
    />
  );
}
