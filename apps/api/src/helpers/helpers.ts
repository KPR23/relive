import z from 'zod';
import { db } from '../db/index.js';
import { photo } from '../db/schema.js';
import { PhotoMissingThumbPathError } from '../photo/photo.errors.js';
import { PhotoListItem } from '../photo/photo.schema.js';
import { StorageService } from '../storage/storage.service.js';

export function asNumber(v: unknown): number | undefined {
  return typeof v === 'number' && Number.isFinite(v) ? v : undefined;
}

export function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export function asDate(v: unknown): Date | undefined {
  return v instanceof Date ? v : undefined;
}

export const dateFromString = z.preprocess((arg) => {
  if (arg === null || arg === undefined) return null;
  if (arg instanceof Date) return arg;
  if (typeof arg === 'string') return new Date(arg);
  return null;
}, z.date().nullable());

export type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => any
  ? T
  : never;

export async function mapPhotosToResponse(
  photos: (typeof photo.$inferSelect)[],
  storage: StorageService,
): Promise<PhotoListItem[]> {
  const photosWithThumbnails = await Promise.all(
    photos.map(async (photo) => {
      if (!photo.thumbPath) {
        throw new PhotoMissingThumbPathError(photo.id);
      }

      const { signedUrl } = await storage.getSignedUrl(
        photo.thumbPath,
        60 * 10,
      );

      return {
        photoId: photo.id,
        folderId: photo.folderId,
        originalName: photo.originalName,
        createdAt: photo.createdAt,
        width: photo.width,
        height: photo.height,
        thumbnailUrl: signedUrl,
        cameraMake: photo.cameraMake,
        cameraModel: photo.cameraModel,
        lensModel: photo.lensModel,
        exposureTime: photo.exposureTime,
        fNumber: photo.fNumber,
        iso: photo.iso,
        focalLength: photo.focalLength,
        focalLength35mm: photo.focalLength35mm,
        gpsLat: photo.gpsLat,
        gpsLng: photo.gpsLng,
        gpsAltitude: photo.gpsAltitude,
        takenAt: photo.takenAt,
      };
    }),
  );

  return photosWithThumbnails;
}
