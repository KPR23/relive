'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Photo, SharedPhoto } from '../../../lib/types';
import { useMoveableFolders } from '../../folders/hooks';
import {
  useMovePhotoToFolder,
  usePhotoUrl,
  useRemovePhoto,
  useRemovePhotoFromFolder,
  useRevokePhotoShare,
  useSharedWith,
  useSharePhotoWithUser,
} from '../hooks';
import { downloadPhoto } from './DownloadPhoto';
import {
  useCreatePhotoShareLink,
  useListPhotoShareLinks,
  useRevokeShareLink,
} from '@/src/features/share-link/hooks';
import { SHARE_FOREVER_DATE } from '../../../../../../packages/constants';
import { toast } from 'sonner';
import { env } from '../../../env.client';

type PhotoSource = 'folder' | 'shared';

interface PhotoLightboxProps {
  photo: Photo | SharedPhoto;
  thumbnailUrl: string;
  onClose: () => void;
  source?: PhotoSource;
}

export function PhotoLightbox({
  photo,
  thumbnailUrl,
  onClose,
  source = 'folder',
}: PhotoLightboxProps) {
  const [isFullLoaded, setIsFullLoaded] = useState(false);
  const [shouldLoadFolders, setShouldLoadFolders] = useState(false);
  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [expiresMode, setExpiresMode] = useState<'forever' | 'date'>('forever');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [linkPermission, setLinkPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [linkExpiresIn, setLinkExpiresIn] = useState<string>('365');
  const [linkCustomExpiresAt, setLinkCustomExpiresAt] = useState<string>('');
  const [linkPassword, setLinkPassword] = useState('');
  const [createdLink, setCreatedLink] = useState<string | null>(null);
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
  const createPhotoShareLink = useCreatePhotoShareLink();
  const revokePhotoShare = useRevokePhotoShare();
  const revokeShareLink = useRevokeShareLink();
  const sharedWith = useSharedWith(photo.photoId);
  const { data: photoShareLinks } = useListPhotoShareLinks(photo.photoId);

  const ownerName = 'ownerName' in photo ? photo.ownerName : undefined;
  const isOwner = source === 'folder' && ownerName == null;
  const isFromSharedFolder = source === 'folder' && !isOwner;
  const isDirectlyShared = source === 'shared';

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
    if (expiresMode === 'date' && !expiresAt.trim()) return;

    const expiresAtDate =
      expiresMode === 'forever'
        ? new Date(SHARE_FOREVER_DATE)
        : new Date(expiresAt);

    sharePhotoWithUser.mutate(
      {
        photoId: photo.photoId,
        targetUserEmail,
        permission: 'VIEW',
        expiresAt: expiresAtDate,
      },
      {
        onSuccess: () => {
          setTargetUserEmail('');
          setExpiresMode('forever');
          setExpiresAt('');
        },
      },
    );

    setTargetUserEmail('');
    setExpiresMode('forever');
    setExpiresAt('');
  };

  const canShare =
    targetUserEmail.trim() &&
    (expiresMode === 'forever' || (expiresMode === 'date' && expiresAt.trim()));

  const LINK_EXPIRATION_OPTIONS = [
    { value: '7', label: '7 days' },
    { value: '30', label: '30 days' },
    { value: '365', label: '1 year' },
    { value: 'never', label: 'Never expires' },
    { value: 'custom', label: 'Custom date' },
  ] as const;

  const getLinkExpiresAt = (daysOrNever: string, customDate?: string): Date => {
    if (daysOrNever === 'never') return new Date('2099-12-31');
    if (daysOrNever === 'custom' && customDate) return new Date(customDate);
    const days = parseInt(daysOrNever, 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const handleCreatePhotoLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkExpiresIn === 'custom' && !linkCustomExpiresAt.trim()) return;
    setCreatedLink(null);
    createPhotoShareLink.mutate(
      {
        photoId: photo.photoId,
        permission: linkPermission,
        expiresAt: getLinkExpiresAt(linkExpiresIn, linkCustomExpiresAt),
        password: linkPassword.trim() || undefined,
      },
      {
        onSuccess: (data) => {
          const base =
            env.NEXT_PUBLIC_APP_URL?.toString() ??
            (typeof window !== 'undefined' ? window.location.origin : '');
          const url = `${base}/shared/${data.token}`;
          setCreatedLink(url);
          setLinkCustomExpiresAt('');
        },
      },
    );
  };

  const copyPhotoLink = () => {
    if (createdLink) {
      void navigator.clipboard.writeText(createdLink).then(() => {
        toast.success('Link copied');
      });
    }
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
        <div className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-md dark:bg-gray-900/90">
          {isFromSharedFolder ? (
            <div className="rounded-md bg-amber-50 px-4 py-3 dark:bg-amber-900/20">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                From shared folder by
              </p>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {ownerName ?? '(unknown)'}
              </p>
            </div>
          ) : isDirectlyShared ? (
            <div className="rounded-md bg-blue-50 px-4 py-3 dark:bg-blue-900/20">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Shared by
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {ownerName ?? '(unknown)'}
              </p>
            </div>
          ) : isOwner ? (
            <>
              {/* ===== Delete / Move ===== */}
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

              {/* ===== Move ===== */}
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

              {/* ===== Share form ===== */}
              <form onSubmit={handleSharePhoto} className="mt-6 space-y-2">
                <label className="block text-sm font-medium">
                  Share with user
                </label>
                <input
                  type="email"
                  value={targetUserEmail}
                  onChange={(e) => setTargetUserEmail(e.target.value)}
                  placeholder="user@email.com"
                  className="w-full rounded-md border px-3 py-2 text-sm"
                />
                <label className="block text-sm font-medium">
                  Share expiration
                </label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="expiresMode"
                      value="forever"
                      checked={expiresMode === 'forever'}
                      onChange={() => setExpiresMode('forever')}
                      className="rounded"
                    />
                    <span className="text-sm">Forever</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="expiresMode"
                      value="date"
                      checked={expiresMode === 'date'}
                      onChange={() => setExpiresMode('date')}
                      className="rounded"
                    />
                    <span className="text-sm">Until date</span>
                  </label>
                </div>
                {expiresMode === 'date' && (
                  <input
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    required
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                )}
                <button
                  type="submit"
                  disabled={!canShare || sharePhotoWithUser.isPending}
                  className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {sharePhotoWithUser.isPending ? 'Sharing...' : 'Share'}
                </button>
              </form>

              {/* ===== Shared With List ===== */}
              <div className="mt-8">
                <h3 className="mb-2 text-sm font-semibold">Shared with</h3>

                {sharedWith.isLoading && (
                  <p className="text-xs text-gray-500">Loading...</p>
                )}

                {!sharedWith.isLoading &&
                  (!sharedWith.data || sharedWith.data.length === 0) && (
                    <p className="text-xs text-gray-500">
                      Not shared with anyone
                    </p>
                  )}

                <ul className="space-y-2">
                  {sharedWith.data?.map((share) => (
                    <li
                      key={share.id}
                      className="flex items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {share.sharedWithEmail}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {share.permission}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {share.status}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {share.expiresAt &&
                          new Date(share.expiresAt).getFullYear() >=
                            SHARE_FOREVER_DATE.getFullYear()
                            ? 'Forever'
                            : share.expiresAt
                              ? new Date(share.expiresAt).toLocaleDateString(
                                  'en-US',
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: 'numeric',
                                  },
                                )
                              : ''}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          revokePhotoShare.mutate({
                            photoId: photo.photoId,
                            targetUserId: share.sharedWithId,
                          })
                        }
                        disabled={revokePhotoShare.isPending}
                        className="ml-2 rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-900/30"
                        aria-label={`Revoke access for ${share.sharedWithEmail}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ===== Share link ===== */}
              <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
                <h3 className="mb-2 text-sm font-semibold">Share via link</h3>
                <form onSubmit={handleCreatePhotoLink} className="space-y-2">
                  <select
                    value={linkPermission}
                    onChange={(e) =>
                      setLinkPermission(e.target.value as 'VIEW' | 'EDIT')
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="VIEW">View</option>
                    <option value="EDIT">Edit</option>
                  </select>
                  <select
                    value={linkExpiresIn}
                    onChange={(e) => setLinkExpiresIn(e.target.value)}
                    className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  >
                    {LINK_EXPIRATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {linkExpiresIn === 'custom' && (
                    <input
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      value={linkCustomExpiresAt}
                      onChange={(e) => setLinkCustomExpiresAt(e.target.value)}
                      required={linkExpiresIn === 'custom'}
                      className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                    />
                  )}
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="Password (optional)"
                    className="w-full rounded-md border px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"
                  />
                  <button
                    type="submit"
                    disabled={
                      createPhotoShareLink.isPending ||
                      (linkExpiresIn === 'custom' &&
                        !linkCustomExpiresAt.trim())
                    }
                    className="w-full rounded-md bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    {createPhotoShareLink.isPending
                      ? 'Creating...'
                      : 'Create link'}
                  </button>
                </form>
                {createPhotoShareLink.isError && (
                  <p className="mt-1 text-xs text-red-500">
                    {createPhotoShareLink.error?.message ?? 'An error occurred'}
                  </p>
                )}
                {createdLink && (
                  <div className="mt-2 flex gap-1">
                    <input
                      type="text"
                      readOnly
                      value={createdLink}
                      className="flex-1 rounded-md border px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                    />
                    <button
                      type="button"
                      onClick={copyPhotoLink}
                      className="rounded-md bg-blue-600 px-2 py-1.5 text-xs text-white hover:bg-blue-700"
                    >
                      Copy
                    </button>
                  </div>
                )}

                {photoShareLinks && photoShareLinks.length > 0 && (
                  <div className="mt-3">
                    <h4 className="mb-2 text-sm font-semibold">Share links</h4>
                    <ul className="space-y-2">
                      {photoShareLinks.map((link) => {
                        const linkUrl =
                          typeof window !== 'undefined'
                            ? `${window.location.origin}/s/${link.token}`
                            : `/s/${link.token}`;
                        const isRevoked = !!link.revokedAt;
                        const isExpired =
                          link.expiresAt &&
                          new Date(link.expiresAt).getTime() < Date.now();
                        const status = isRevoked
                          ? 'Revoked'
                          : isExpired
                            ? 'Expired'
                            : 'Active';
                        return (
                          <li
                            key={link.id}
                            className="flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2 text-xs dark:bg-gray-800"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="block truncate font-medium">
                                ...{link.token.slice(-8)}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {link.permission} · {status}
                                {link.hasPassword && ' · 🔒'}
                              </span>
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {!isRevoked && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void navigator.clipboard.writeText(linkUrl);
                                    toast.success('Link copied');
                                  }}
                                  className="rounded px-2 py-0.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                >
                                  Copy
                                </button>
                              )}
                              {!isRevoked && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    revokeShareLink.mutate({
                                      token: link.token,
                                    })
                                  }
                                  disabled={revokeShareLink.isPending}
                                  className="rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-900/30"
                                  aria-label="Revoke link"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </>
          ) : null}
          <a
            href={data?.signedUrl}
            download={photo.originalName}
            onClick={async (e) => {
              e.preventDefault();
              if (!data?.signedUrl) return;
              setIsDownloading(true);
              setDownloadError(null);
              try {
                await downloadPhoto(data.signedUrl, photo.originalName);
              } catch {
                setDownloadError('Download failed. Please try again.');
              } finally {
                setIsDownloading(false);
              }
            }}
            className={`flex w-full items-center justify-center rounded-md py-2 text-sm font-medium text-white transition ${isDownloading ? 'cursor-not-allowed bg-green-400 opacity-50' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </a>
          {downloadError && (
            <p className="mt-2 text-sm text-red-500">{downloadError}</p>
          )}
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
              key={data.signedUrl}
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
