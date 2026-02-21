'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Photo, SharedPhoto } from '../../../lib/types';
import { PhotoLightbox } from './PhotoLightbox';

const ROW_HEIGHT = 120;

type PhotoSource = 'folder' | 'shared';

export function PhotoItem({
  photo,
  source = 'folder',
}: {
  photo: Photo | SharedPhoto;
  source?: PhotoSource;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const calculatedWidth = Math.round(
    (ROW_HEIGHT * (photo.width ?? 0)) / (photo.height ?? 0),
  );

  const style: React.CSSProperties = {
    height: ROW_HEIGHT,
    width: calculatedWidth,
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-90 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        style={style}
      >
        <Image
          src={photo.thumbnailUrl}
          alt={photo.originalName}
          width={style.width as number}
          height={style.height as number}
          className="h-full w-full object-cover"
          loading="lazy"
          unoptimized
        />
      </button>

      {isOpen && (
        <PhotoLightbox
          thumbnailUrl={photo.thumbnailUrl}
          photo={photo}
          onClose={() => setIsOpen(false)}
          source={source}
        />
      )}
    </>
  );
}
