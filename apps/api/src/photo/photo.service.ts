import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { photo, photoShare, PhotoStatusEnum } from '../db/schema.js';
import { FolderService } from '../folder/folder.service.js';
import { mapPhotosToResponse } from '../helpers/helpers.js';
import { B2Storage } from '../storage/b2.storage.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import {
  PhotoAlreadyInFolderError,
  PhotoAlreadyInRootFolderError,
  PhotoRemoveFailedError,
  ThumbnailNotFoundError,
} from './photo.errors.js';
@Injectable()
export class PhotoService {
  constructor(
    private readonly storage: B2Storage,
    private readonly photoPermissionService: PhotoPermissionService,
    private readonly folderService: FolderService,
  ) {}

  async listAllPhotos(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(eq(photo.ownerId, userId), eq(photo.status, PhotoStatusEnum.READY)),
      )
      .orderBy(desc(photo.createdAt));

    return mapPhotosToResponse(photos, this.storage);
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

    return mapPhotosToResponse(photos, this.storage);
  }

  async getThumbnailUrl(userId: string, photoId: string) {
    const photoRecord =
      await this.photoPermissionService.getViewablePhotoOrThrow(
        userId,
        photoId,
      );

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
    const photoRecord =
      await this.photoPermissionService.getViewablePhotoOrThrow(
        userId,
        photoId,
      );

    return this.storage.getSignedUrl(photoRecord.filePath);
  }

  async movePhotoToFolder(userId: string, photoId: string, folderId: string) {
    return db.transaction(async (tx) => {
      const photoRecord =
        await this.photoPermissionService.getOwnedPhotoOrThrow(
          userId,
          photoId,
          tx,
        );
      await this.folderService.getOwnedFolderOrThrow(userId, folderId, tx);

      if (photoRecord.folderId === folderId) {
        throw new PhotoAlreadyInFolderError();
      }

      await tx.update(photo).set({ folderId }).where(eq(photo.id, photoId));
    });
  }

  async removePhoto(userId: string, photoId: string) {
    const photoRecord = await this.photoPermissionService.getOwnedPhotoOrThrow(
      userId,
      photoId,
    );

    try {
      await db.transaction(async (tx) => {
        await tx.delete(photoShare).where(eq(photoShare.photoId, photoId));

        await tx.delete(photo).where(eq(photo.id, photoId));
      });

      await this.storage.delete(photoRecord.filePath);

      if (photoRecord.thumbPath) {
        await this.storage.delete(photoRecord.thumbPath);
      }

      return { success: true };
    } catch (err) {
      console.error(`Failed to remove photo ${photoId}`, err);
      throw new PhotoRemoveFailedError('Failed to remove photo', err);
    }
  }

  async removePhotoFromFolder(userId: string, photoId: string) {
    return db.transaction(async (tx) => {
      const photoRecord =
        await this.photoPermissionService.getOwnedPhotoOrThrow(
          userId,
          photoId,
          tx,
        );
      const rootFolder = await this.folderService.ensureRootFolder(userId, tx);

      if (photoRecord.folderId === rootFolder.id) {
        throw new PhotoAlreadyInRootFolderError();
      }

      await tx
        .update(photo)
        .set({ folderId: rootFolder.id })
        .where(eq(photo.id, photoId))
        .returning();

      return { success: true };
    });
  }
}
