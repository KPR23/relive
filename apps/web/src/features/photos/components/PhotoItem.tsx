'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useThumbnailUrl } from '../hooks';
import { Photo } from '../../types';
import { PhotoLightbox } from './PhotoLightbox';

export function PhotoItem({ photo }: { photo: Photo }) {
  const { data, isLoading } = useThumbnailUrl(photo.photoId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return <div>Loading image…</div>;

  if (!data) return <div>Image not found</div>;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="overflow-hidden rounded-lg transition-transform hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <Image
          src={data.signedUrl}
          alt={photo.originalName}
          width={300}
          height={300}
          className="h-auto w-full object-cover"
        />
      </button>

      {isOpen && (
        <PhotoLightbox photo={photo} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
