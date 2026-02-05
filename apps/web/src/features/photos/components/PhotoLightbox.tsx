'use client';

import Image from 'next/image';
import { usePhotoUrl } from '../hooks';
import { Photo } from '../../../lib/types';
import { useState } from 'react';

interface PhotoLightboxProps {
  photo: Photo;
  thumbnailUrl: string;
  onClose: () => void;
}

export function PhotoLightbox({
  photo,
  thumbnailUrl,
  onClose,
}: PhotoLightboxProps) {
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const { data } = usePhotoUrl(photo.photoId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
    >
      <button
        className="absolute top-4 right-4 text-3xl text-white hover:text-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close"
      >
        ✕
      </button>

      <div
        className="relative h-[90vh] w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={thumbnailUrl}
          alt={photo.originalName}
          fill
          className="object-contain"
          sizes="90vw"
        />

        {data && (
          <Image
            src={data.signedUrl}
            alt={photo.originalName}
            fill
            className="object-contain transition-opacity duration-300"
            style={{ opacity: isFullLoaded ? 1 : 0 }}
            onLoad={() => setIsFullLoaded(true)}
            sizes="90vw"
            priority
          />
        )}
      </div>
    </div>
  );
}
