import { Injectable } from '@nestjs/common';
import { and, count, eq, inArray, lt, or } from 'drizzle-orm';
import { db } from '../db/index.js';
import { photo, PhotoStatusEnum } from '../db/schema.js';
import { FolderPermissionService } from '../folder/folder-permission.service.js';
import { StorageService } from '../storage/storage.service.js';
import {
  PhotoLimitReachedError,
  PhotoNotFoundError,
  PhotoUploadConfirmFailedError,
} from './photo.errors.js';
import { ConfirmUploadPhoto, CreatePendingPhoto } from './photo.schema.js';
import { generateAndUploadThumbnail } from './thumbnail.js';

@Injectable()
export class PhotoUploadService {
  constructor(
    private readonly storage: StorageService,
    private readonly folderPermissionService: FolderPermissionService,
  ) {}

  async createPending(data: CreatePendingPhoto) {
    const PHOTO_LIMIT_PER_USER = 20;

    return db.transaction(async (tx) => {
      await this.folderPermissionService.getOwnedFolderOrThrow(
        data.ownerId,
        data.folderId,
        tx,
      );

      const userPhotos = await tx
        .select({ count: count() })
        .from(photo)
        .where(
          and(
            eq(photo.ownerId, data.ownerId),
            or(
              eq(photo.status, PhotoStatusEnum.READY),
              eq(photo.status, PhotoStatusEnum.PENDING),
            ),
          ),
        );

      const userPhotoCount = userPhotos[0].count;

      if (userPhotoCount >= PHOTO_LIMIT_PER_USER) {
        throw new PhotoLimitReachedError();
      }

      await tx.insert(photo).values({
        id: data.id,
        ownerId: data.ownerId,
        folderId: data.folderId,
        filePath: data.filePath,
        originalName: data.originalName,
        mimeType: data.mimeType,
        status: PhotoStatusEnum.PENDING,
      });
    });
  }

  async confirmUpload(data: ConfirmUploadPhoto) {
    return db.transaction(async (tx) => {
      const [photoRecord] = await tx
        .select()
        .from(photo)
        .where(
          and(
            eq(photo.id, data.photoId),
            eq(photo.ownerId, data.ownerId),
            eq(photo.status, PhotoStatusEnum.PENDING),
          ),
        )
        .limit(1);

      if (!photoRecord) {
        throw new PhotoNotFoundError();
      }

      const thumbPath = `photos/${photoRecord.ownerId}/${photoRecord.id}_thumb.jpg`;

      try {
        const { size } = await this.storage.getFileInfo(photoRecord.filePath);

        const { width, height, exif } = await generateAndUploadThumbnail({
          storage: this.storage,
          originalKey: photoRecord.filePath,
          thumbKey: thumbPath,
        });

        await tx
          .update(photo)
          .set({
            status: PhotoStatusEnum.READY,
            size,
            thumbPath,
            width,
            height,
            cameraMake: exif?.cameraMake,
            cameraModel: exif?.cameraModel,
            lensModel: exif?.lensModel,
            exposureTime: exif?.exposureTime,
            fNumber: exif?.fNumber,
            iso: exif?.iso,
            focalLength: exif?.focalLength,
            focalLength35mm: exif?.focalLength35mm,
            gpsLat: exif?.gpsLat,
            gpsLng: exif?.gpsLng,
            gpsAltitude: exif?.gpsAltitude,
            takenAt: exif?.takenAt,
          })
          .where(
            and(eq(photo.id, data.photoId), eq(photo.ownerId, data.ownerId)),
          );

        return {
          status: PhotoStatusEnum.READY,
        };
      } catch (err) {
        console.error(
          `Failed to confirm upload for photo ${photoRecord.id}`,
          err,
        );

        await tx
          .update(photo)
          .set({
            status: PhotoStatusEnum.FAILED,
          })
          .where(
            and(eq(photo.id, data.photoId), eq(photo.ownerId, data.ownerId)),
          );

        throw new PhotoUploadConfirmFailedError(err);
      }
    });
  }

  async cleanupFailedAndPendingPhotos(): Promise<{ success: boolean }> {
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const photosToDelete = await db
        .update(photo)
        .set({ status: PhotoStatusEnum.DELETING })
        .where(
          and(
            inArray(photo.status, [
              PhotoStatusEnum.FAILED,
              PhotoStatusEnum.PENDING,
              PhotoStatusEnum.DELETING,
            ]),
            lt(photo.createdAt, cutoffDate),
          ),
        )
        .returning({
          id: photo.id,
          filePath: photo.filePath,
          thumbPath: photo.thumbPath,
        });

      if (photosToDelete.length === 0) return { success: true };

      const keysToDelete = photosToDelete.flatMap((p) => [
        p.filePath,
        ...(p.thumbPath ? [p.thumbPath] : []),
      ]);

      await this.storage.deleteMany(keysToDelete);

      await db.delete(photo).where(
        inArray(
          photo.id,
          photosToDelete.map((p) => p.id),
        ),
      );

      return { success: true };
    } catch (err) {
      console.error('Failed to delete photos', err);
      throw err;
    }
  }
}
