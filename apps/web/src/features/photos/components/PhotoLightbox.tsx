'use client';

import Image from 'next/image';
import { usePhotoUrl } from '../hooks';
import { Photo } from '../../types';

interface PhotoLightboxProps {
  photo: Photo;
  onClose: () => void;
}

export function PhotoLightbox({ photo, onClose }: PhotoLightboxProps) {
  const { data, isLoading } = usePhotoUrl(photo.photoId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-3xl text-white hover:text-gray-300"
        onClick={onClose}
        aria-label="Close"
      >
        ✕
      </button>

      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {isLoading ? (
          <div className="flex h-64 w-64 items-center justify-center text-white">
            Loading full image…
          </div>
        ) : data ? (
          <Image
            src={data.signedUrl}
            alt={photo.originalName}
            width={photo.width ?? 1200}
            height={photo.height ?? 800}
            className="max-h-[90vh] w-auto object-contain"
            priority
          />
        ) : (
          <div className="text-white">Failed to load image</div>
        )}
      </div>
    </div>
  );
}
