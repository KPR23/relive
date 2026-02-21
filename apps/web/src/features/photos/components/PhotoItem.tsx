'use client';

import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import { useState } from 'react';
import { Photo, SharedPhoto } from '../../../lib/types';
import { PhotoLightbox } from './PhotoLightbox';

const ROW_HEIGHT = 120;

type PhotoSource = 'folder' | 'shared';

export function PhotoItem({
  photo,
  source = 'folder',
  selected,
  setSelected,
}: {
  photo: Photo | SharedPhoto;
  source?: PhotoSource;
  selected?: string[];
  setSelected?: (selected: string[]) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const calculatedWidth =
    photo.height && photo.height > 0
      ? Math.round((ROW_HEIGHT * (photo.width ?? ROW_HEIGHT)) / photo.height)
      : ROW_HEIGHT;

  const style: React.CSSProperties = {
    height: ROW_HEIGHT,
    width: calculatedWidth,
  };

  const handleSelect = () => {
    if (selected && setSelected) {
      if (selected.includes(photo.photoId)) {
        setSelected(selected.filter((id) => id !== photo.photoId));
      } else {
        setSelected([...selected, photo.photoId]);
      }
    }
  };

  return (
    <>
      <div className="relative">
        <Checkbox
          className="absolute top-2 left-2 z-10 border-2 border-red-600"
          checked={selected?.includes(photo.photoId)}
          onCheckedChange={handleSelect}
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
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
      </div>

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
