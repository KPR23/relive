'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useThumbnailUrl } from '../hooks';
import { Photo } from '../../types';
import { PhotoLightbox } from './PhotoLightbox';

const ROW_HEIGHT = 120;

export function PhotoItem({ photo }: { photo: Photo }) {
  const { data, isLoading } = useThumbnailUrl(photo.photoId);
  const [isOpen, setIsOpen] = useState(false);

  const aspectRatio = (photo.width ?? 1) / (photo.height ?? 1);
  const calculatedWidth = Math.round(ROW_HEIGHT * aspectRatio);

  if (isLoading) {
    return (
      <div
        className="animate-pulse rounded bg-gray-700"
        style={{ width: calculatedWidth, height: ROW_HEIGHT }}
      />
    );
  }

  if (!data) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        style={{ height: ROW_HEIGHT, width: calculatedWidth }}
      >
        <Image
          src={data.signedUrl}
          alt={photo.originalName}
          width={calculatedWidth}
          height={ROW_HEIGHT}
          className="h-full w-full object-cover"
        />
      </button>

      {isOpen && (
        <PhotoLightbox photo={photo} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
