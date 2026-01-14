'use client';

import { redirect } from 'next/navigation';
import { trpc } from '../trpc/client';

export default function Home() {
  const mutation = trpc.photo.requestUpload.useMutation();

  const handleUpload = async (file: File, folderId: string) => {
    const { uploadUrl, photoId } = await mutation.mutateAsync({
      folderId,
      mimeType: file.type,
      originalName: file.name,
    });
    console.log('Upload URL:', uploadUrl, 'Photo ID:', photoId);
  };

  return (
    <div>
      <h1>Relive</h1>
      <button
        className="flex cursor-pointer rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
        onClick={() => redirect('/home')}
      >
        Home folder
      </button>
    </div>
  );
}
