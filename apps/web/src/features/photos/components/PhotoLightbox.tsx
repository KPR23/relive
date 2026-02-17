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
  useSharePhotoWithUser,
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
  const [targetUserEmail, setTargetUserEmail] = useState('');

  const selectRef = useRef<HTMLSelectElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { data: folders, isLoading: isLoadingFolders } = useMoveableFolders(
    photo.folderId,
    {
      enabled: shouldLoadFolders,
    },
  );

  const movePhotoToFolder = useMovePhotoToFolder();
  const removePhotoFromFolder = useRemovePhotoFromFolder();
  const removePhoto = useRemovePhoto();
  const sharePhotoWithUser = useSharePhotoWithUser();

  const { data } = usePhotoUrl(photo.photoId, {
    enabled: !removePhoto.isPending && !removePhoto.isSuccess,
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    closeButtonRef.current?.focus();
    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (movePhotoToFolder.isSuccess && selectRef.current) {
      selectRef.current.value = '';
      movePhotoToFolder.reset();
    }
  }, [movePhotoToFolder]);

  const handleRemoveFromFolder = () => {
    removePhotoFromFolder.mutate({ photoId: photo.photoId });
  };

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

  const handleSharePhoto = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetUserEmail.trim()) return;

    sharePhotoWithUser.mutate(
      {
        photoId: photo.photoId,
        targetUserEmail,
        permission: 'VIEW',
      },
      {
        onSuccess: () => {
          setTargetUserEmail('');
        },
      },
    );

    setTargetUserEmail('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        ref={closeButtonRef}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 focus:outline-none"
        aria-label="Close"
      >
        ✕
      </button>

      <div
        className="relative flex h-[90vh] w-[95vw] max-w-[1600px] gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-80 shrink-0 overflow-y-auto rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-md dark:bg-gray-900/90">
          <div className="space-y-2">
            <button
              onClick={handleRemoveFromFolder}
              disabled={removePhotoFromFolder.isPending}
              className="w-full rounded-md bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              {removePhotoFromFolder.isPending
                ? 'Removing...'
                : 'Remove from folder'}
            </button>

            <button
              onClick={handleRemovePhoto}
              disabled={removePhoto.isPending}
              className="w-full rounded-md bg-red-700 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              {removePhoto.isPending ? 'Deleting...' : 'Delete permanently'}
            </button>
          </div>

          <div className="mt-6">
            <label className="mb-1 block text-sm font-medium">
              Move to folder
            </label>
            <select
              ref={selectRef}
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
              className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="">
                {isLoadingFolders ? 'Loading...' : 'Select folder'}
              </option>
              {folders?.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <form onSubmit={handleSharePhoto} className="mt-6 space-y-2">
            <label className="block text-sm font-medium">Share with user</label>
            <input
              type="email"
              value={targetUserEmail}
              onChange={(e) => setTargetUserEmail(e.target.value)}
              placeholder="user@email.com"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sharePhotoWithUser.isPending}
              className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {sharePhotoWithUser.isPending ? 'Sharing...' : 'Share'}
            </button>
          </form>
        </div>

        <div className="relative flex-1">
          <Image
            src={thumbnailUrl}
            alt={photo.originalName}
            fill
            className="object-contain"
            sizes="(max-width: 1600px) 100vw, 1600px"
          />

          {data && (
            <Image
              src={data.signedUrl}
              alt={photo.originalName}
              fill
              className="object-contain transition-opacity duration-300"
              style={{ opacity: isFullLoaded ? 1 : 0 }}
              onLoad={() => setIsFullLoaded(true)}
              sizes="(max-width: 1600px) 100vw, 1600px"
              priority
            />
          )}
        </div>
      </div>
    </div>
  );
}
