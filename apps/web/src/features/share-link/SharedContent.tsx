'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RouterOutputs } from '@/src/trpc/client';

type SharedData = RouterOutputs['share']['getSharedContent'];

interface SharedPhotoWithFullUrl {
  photoId: string;
  originalName: string;
  thumbnailUrl: string;
  fullUrl?: string;
}

interface SharedContentProps {
  data: SharedData;
  token: string;
  onPasswordSubmit: (password: string) => void;
}

export function SharedContent({ data, onPasswordSubmit }: SharedContentProps) {
  const [password, setPassword] = useState('');
  const [lightboxPhoto, setLightboxPhoto] =
    useState<SharedPhotoWithFullUrl | null>(null);

  if (data.requiresPassword) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-amber-700/30 bg-amber-950/50 p-8">
        <h2 className="text-lg font-semibold text-amber-100">
          This resource is password protected
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password.trim()) onPasswordSubmit(password.trim());
          }}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="rounded-lg border border-amber-700/40 bg-amber-900/30 px-4 py-2 text-amber-100 placeholder-amber-500/60 focus:border-amber-500 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            disabled={!password.trim()}
            className="rounded-lg bg-amber-700 px-4 py-2 font-medium text-amber-50 hover:bg-amber-600 disabled:opacity-50"
          >
            Open
          </button>
        </form>
      </div>
    );
  }

  if (data.type === 'photo' && 'data' in data) {
    const photo = data.data;
    const imageUrl = 'fullUrl' in photo ? photo.fullUrl : photo.thumbnailUrl;
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-block text-amber-400 hover:text-amber-300"
        >
          ← Home
        </Link>
        <div className="overflow-hidden rounded-xl border border-amber-700/20">
          <div className="relative min-h-[85vh] w-full">
            <Image
              src={imageUrl}
              alt={photo.originalName}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
              priority
            />
          </div>
          <div className="border-t border-amber-700/20 bg-amber-950/30 px-4 py-3">
            <p className="text-sm font-medium text-amber-100">
              {photo.originalName}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (data.type === 'folder' && 'data' in data) {
    const folder = data.data;
    const photos = 'photos' in folder ? folder.photos : [];

    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-block text-amber-400 hover:text-amber-300"
        >
          ← Home
        </Link>
        <div className="rounded-xl border border-amber-700/20 bg-amber-950/30 p-4">
          <h1 className="text-xl font-semibold text-amber-100">
            {folder.name}
          </h1>
          {folder.description && (
            <p className="mt-1 text-sm text-amber-200/80">
              {folder.description}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((photo: SharedPhotoWithFullUrl) => {
            return (
              <button
                key={photo.photoId}
                type="button"
                onClick={() => setLightboxPhoto(photo)}
                className="group overflow-hidden rounded-lg border border-amber-700/20 text-left transition hover:border-amber-600/40"
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.originalName}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    unoptimized
                  />
                </div>
                <p className="truncate px-2 py-1 text-xs text-amber-200/90">
                  {photo.originalName}
                </p>
              </button>
            );
          })}
        </div>
        {photos.length === 0 && (
          <p className="py-8 text-center text-amber-500/80">
            No photos in this folder
          </p>
        )}

        {lightboxPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setLightboxPhoto(null)}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              ✕
            </button>
            <div
              className="relative h-[90vh] w-full max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={
                  'fullUrl' in lightboxPhoto && lightboxPhoto.fullUrl
                    ? lightboxPhoto.fullUrl
                    : lightboxPhoto.thumbnailUrl
                }
                alt={lightboxPhoto.originalName}
                fill
                className="object-contain"
                sizes="90vw"
                unoptimized
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-700/30 p-8 text-center text-amber-200">
      Unsupported resource type
    </div>
  );
}
