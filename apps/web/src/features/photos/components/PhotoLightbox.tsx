'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Photo } from '../../../lib/types';
import { useMoveableFolders } from '../../folders/hooks';
import {
  useMovePhotoToFolder,
  usePhotoUrl,
  useRemovePhoto,
  useRemovePhotoFromFolder,
} from '../hooks';

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
  const [shouldLoadFolders, setShouldLoadFolders] = useState(false);

  const selectRef = useRef<HTMLSelectElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: folders, isLoading: isLoadingFolders } = useMoveableFolders(
    photo.folderId,
    { enabled: shouldLoadFolders },
  );

  const movePhotoToFolder = useMovePhotoToFolder();
  const removePhotoFromFolder = useRemovePhotoFromFolder();
  const removePhoto = useRemovePhoto();

  const { data } = usePhotoUrl(photo.photoId, {
    enabled: !removePhoto.isPending && !removePhoto.isSuccess,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    closeButtonRef.current?.focus();

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (movePhotoToFolder.isSuccess && selectRef.current) {
      selectRef.current.value = '';
      const timer = setTimeout(() => {
        movePhotoToFolder.reset();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [movePhotoToFolder]);

  const handleRemovePhoto = () => {
    removePhoto.mutate(
      { photoId: photo.photoId },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
    >
      <button
        ref={closeButtonRef}
        className="absolute top-4 right-4 rounded text-3xl text-white hover:text-gray-300 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close photo preview"
      >
        ✕
      </button>
      <button
        onClick={() => removePhotoFromFolder.mutate({ photoId: photo.photoId })}
        disabled={removePhotoFromFolder.isPending}
        className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-red-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {removePhotoFromFolder.isPending ? 'Removing...' : 'Remove from folder'}
      </button>
      <button
        onClick={handleRemovePhoto}
        disabled={removePhoto.isPending}
        className="cursor-pointer rounded-md bg-red-500 px-4 py-2 text-red-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {removePhoto.isPending ? 'Removing...' : 'Remove'}
      </button>
      {removePhoto.isSuccess && (
        <p
          className="mt-2 text-xs text-green-600 dark:text-green-400"
          role="status"
          aria-live="polite"
        >
          Photo removed successfully!
        </p>
      )}
      {removePhoto.isError && (
        <p
          className="mt-2 text-xs text-red-600 dark:text-red-400"
          role="alert"
          aria-live="assertive"
        >
          Failed to remove photo: {removePhoto.error?.message}
        </p>
      )}
      {removePhotoFromFolder.isSuccess && (
        <p
          className="mt-2 text-xs text-green-600 dark:text-green-400"
          role="status"
          aria-live="polite"
        >
          Photo removed from folder successfully!
        </p>
      )}
      {removePhotoFromFolder.isError && (
        <p
          className="mt-2 text-xs text-red-600 dark:text-red-400"
          role="alert"
          aria-live="assertive"
        >
          Failed to remove photo from folder:{' '}
          {removePhotoFromFolder.error?.message}
        </p>
      )}

      <div
        className="absolute top-16 left-4 z-10 rounded-lg bg-white/90 p-4 backdrop-blur-sm dark:bg-gray-800/90"
        onClick={(e) => e.stopPropagation()}
      >
        <label
          htmlFor="folder-select"
          className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
        >
          Move to folder:
        </label>
        <select
          ref={selectRef}
          id="folder-select"
          onFocus={() => setShouldLoadFolders(true)}
          onChange={(e) => {
            const folderId = e.target.value;
            if (!folderId) return;

            movePhotoToFolder.mutate({
              photoId: photo.photoId,
              folderId,
            });
          }}
          disabled={movePhotoToFolder.isPending}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          aria-label="Select folder to move photo to"
        >
          <option value="">
            {isLoadingFolders ? 'Loading folders...' : 'Select a folder'}
          </option>
          {folders?.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        {movePhotoToFolder.isPending && (
          <p
            className="mt-2 text-xs text-gray-600 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            Moving...
          </p>
        )}
        {movePhotoToFolder.isSuccess && (
          <p
            className="mt-2 text-xs text-green-600 dark:text-green-400"
            role="status"
            aria-live="polite"
          >
            Photo moved successfully!
          </p>
        )}
        {movePhotoToFolder.isError && (
          <p
            className="mt-2 text-xs text-red-600 dark:text-red-400"
            role="alert"
            aria-live="assertive"
          >
            Failed to move photo: {movePhotoToFolder.error?.message}
          </p>
        )}
      </div>

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
