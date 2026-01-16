'use client';

import Image from 'next/image';
import { usePhotoUrl, useThumbnailUrl } from '../hooks';
import { Photo } from '../../types';

export function PhotoItem({ photo }: { photo: Photo }) {
  const { data, isLoading } = useThumbnailUrl(photo.photoId);
  const { data: photoData } = usePhotoUrl(photo.photoId);

  if (isLoading) return <div>Loading image…</div>;

  if (!data) return <div>Image not found</div>;

  return (
    <>
      <Image
        src={photoData?.signedUrl ?? ''}
        alt={photo.originalName}
        width={300}
        height={300}
      />
      <Image
        src={data.signedUrl}
        alt={photo.originalName}
        width={300}
        height={300}
      />
    </>
  );
}
