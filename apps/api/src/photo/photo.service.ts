import { Injectable } from '@nestjs/common';
import {
  and,
  count,
  desc,
  eq,
  exists,
  gt,
  inArray,
  isNull,
  lt,
  or,
} from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  folderShare,
  photo,
  photoShare,
  PhotoStatusEnum,
} from '../db/schema.js';
import { FolderService, Tx } from '../folder/folder.service.js';
import { B2Storage } from '../storage/b2.storage.js';
import {
  PhotoAlreadyInFolderError,
  PhotoAlreadyInRootFolderError,
  PhotoLimitReachedError,
  PhotoMissingThumbPathError,
  PhotoNotFoundError,
  PhotoRemoveFailedError,
  ThumbnailNotFoundError,
} from './photo.errors.js';
import {
  type PhotoListItem,
  ConfirmUploadPhoto,
  CreatePendingPhoto,
} from './photo.schema.js';
import { generateAndUploadThumbnail } from './thumbnail.js';
@Injectable()
export class PhotoService {
  constructor(
    private readonly storage: B2Storage,
    private readonly folderService: FolderService,
  ) {}

  async createPending(data: CreatePendingPhoto) {
    const PHOTO_LIMIT_PER_USER = 20;

    return db.transaction(async (tx) => {
      await this.folderService.getOwnedFolderOrThrow(
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

        return {
          status: PhotoStatusEnum.FAILED,
        };
      }
    });
  }

  async listAllPhotos(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(eq(photo.ownerId, userId), eq(photo.status, PhotoStatusEnum.READY)),
      )
      .orderBy(desc(photo.createdAt));

    return this.mapPhotosToResponse(photos);
  }

  async listPhotos(userId: string, folderId: string) {
    await this.folderService.getOwnedFolderOrThrow(userId, folderId);

    const photos = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.folderId, folderId),
          eq(photo.ownerId, userId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      )
      .orderBy(desc(photo.createdAt));

    return this.mapPhotosToResponse(photos);
  }

  async getThumbnailUrl(userId: string, photoId: string) {
    const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId);

    if (!photoRecord.thumbPath) {
      throw new ThumbnailNotFoundError();
    }

    const { signedUrl, expiresAt } = await this.storage.getSignedUrl(
      photoRecord.thumbPath,
      60 * 10,
    );

    return {
      signedUrl,
      expiresAt,
    };
  }

  async getPhotoUrl(userId: string, photoId: string) {
    const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId);

    return this.storage.getSignedUrl(photoRecord.filePath);
  }

  async movePhotoToFolder(userId: string, photoId: string, folderId: string) {
    return db.transaction(async (tx) => {
      const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId, tx);
      await this.folderService.getOwnedFolderOrThrow(userId, folderId, tx);

      if (photoRecord.folderId === folderId) {
        throw new PhotoAlreadyInFolderError();
      }

      await tx.update(photo).set({ folderId }).where(eq(photo.id, photoId));
    });
  }

  async removePhoto(userId: string, photoId: string) {
    try {
      const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId);

      await db.delete(photo).where(eq(photo.id, photoId));

      await this.storage.delete(photoRecord.filePath);

      if (photoRecord.thumbPath) {
        await this.storage.delete(photoRecord.thumbPath);
      }

      return { success: true };
    } catch (err) {
      if (err instanceof PhotoNotFoundError) throw err;
      console.error(`Failed to remove photo ${photoId}`, err);
      throw new PhotoRemoveFailedError('Failed to remove photo', err);
    }
  }

  async removePhotoFromFolder(userId: string, photoId: string) {
    return db.transaction(async (tx) => {
      const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId, tx);
      const rootFolder = await this.folderService.ensureRootFolder(userId, tx);

      if (photoRecord.folderId === rootFolder.id) {
        throw new PhotoAlreadyInRootFolderError();
      }

      await tx
        .update(photo)
        .set({ folderId: rootFolder.id })
        .where(eq(photo.id, photoId))
        .returning();
    });
  }

  private async getReadyPhotoOrThrow(userId: string, photoId: string, tx?: Tx) {
    const client = tx ?? db;

    const [photoRecord] = await client
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.status, PhotoStatusEnum.READY),
          or(
            eq(photo.ownerId, userId),

            exists(
              client
                .select()
                .from(photoShare)
                .where(
                  and(
                    eq(photoShare.photoId, photo.id),
                    eq(photoShare.sharedWithId, userId),
                    or(
                      isNull(photoShare.expiresAt),
                      gt(photoShare.expiresAt, new Date()),
                    ),
                  ),
                ),
            ),

            exists(
              client
                .select()
                .from(folderShare)
                .where(
                  and(
                    eq(folderShare.folderId, photo.folderId),
                    eq(folderShare.sharedWithId, userId),
                    or(
                      isNull(folderShare.expiresAt),
                      gt(folderShare.expiresAt, new Date()),
                    ),
                  ),
                ),
            ),
          ),
        ),
      )
      .limit(1);

    if (!photoRecord) {
      throw new PhotoNotFoundError();
    }

    return photoRecord;
  }
  private async mapPhotosToResponse(
    photos: (typeof photo.$inferSelect)[],
  ): Promise<PhotoListItem[]> {
    const photosWithThumbnails = await Promise.all(
      photos.map(async (photo) => {
        if (!photo.thumbPath) {
          throw new PhotoMissingThumbPathError(photo.id);
        }

        const { signedUrl } = await this.storage.getSignedUrl(
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

  async sharedPhotosWithMe(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.status, PhotoStatusEnum.READY),
          or(
            exists(
              db
                .select()
                .from(photoShare)
                .where(
                  and(
                    eq(photoShare.photoId, photo.id),
                    eq(photoShare.sharedWithId, userId),
                    or(
                      isNull(photoShare.expiresAt),
                      gt(photoShare.expiresAt, new Date()),
                    ),
                  ),
                ),
            ),

            exists(
              db
                .select()
                .from(folderShare)
                .where(
                  and(
                    eq(folderShare.folderId, photo.folderId),
                    eq(folderShare.sharedWithId, userId),
                    or(
                      isNull(folderShare.expiresAt),
                      gt(folderShare.expiresAt, new Date()),
                    ),
                  ),
                ),
            ),
          ),
        ),
      );

    return this.mapPhotosToResponse(photos);
  }
}
