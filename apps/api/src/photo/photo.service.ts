import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { photo, photoShare, PhotoStatusEnum, user } from '../db/schema.js';
import { FolderPermissionService } from '../folder/folder-permission.service.js';
import { FolderService } from '../folder/folder.service.js';
import { mapPhotosToResponse } from '../helpers/helpers.js';
import { StorageService } from '../storage/storage.service.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import {
  PhotoAlreadyInFolderError,
  PhotoAlreadyInRootFolderError,
  PhotoNotFoundError,
  PhotoRemoveFailedError,
  ThumbnailNotFoundError,
} from './photo.errors.js';
@Injectable()
export class PhotoService {
  constructor(
    private readonly storage: StorageService,
    private readonly photoPermissionService: PhotoPermissionService,
    private readonly folderService: FolderService,
    private readonly folderPermissionService: FolderPermissionService,
  ) {}

  async listAllPhotos(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(eq(photo.ownerId, userId), eq(photo.status, PhotoStatusEnum.READY)),
      )
      .orderBy(desc(photo.createdAt));

    return await mapPhotosToResponse(photos, this.storage);
  }

  async listPhotos(userId: string, folderId: string) {
    await this.folderPermissionService.getViewableFolderOrThrow(
      userId,
      folderId,
    );

    const rows = await db
      .select({
        photo,
        ownerName: user.name,
      })
      .from(photo)
      .leftJoin(user, eq(photo.ownerId, user.id))
      .where(
        and(
          eq(photo.folderId, folderId),
          eq(photo.status, PhotoStatusEnum.READY),
          this.photoPermissionService.buildViewableCondition(userId),
        ),
      )
      .orderBy(desc(photo.createdAt));

    const photos = await mapPhotosToResponse(
      rows.map((r) => r.photo),
      this.storage,
    );

    return photos.map((p, i) => ({
      ...p,
      ownerName:
        rows[i].photo.ownerId !== userId ? (rows[i].ownerName ?? null) : null,
    }));
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
      await this.folderPermissionService.getOwnedFolderOrThrow(
        userId,
        folderId,
        tx,
      );

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

  async getPhotoForShareLink(photoId: string) {
    const [photoRecord] = await db
      .select()
      .from(photo)
      .where(
        and(eq(photo.id, photoId), eq(photo.status, PhotoStatusEnum.READY)),
      );

    if (!photoRecord) {
      throw new PhotoNotFoundError();
    }

    const [mapped] = await mapPhotosToResponse([photoRecord], this.storage);
    const { signedUrl } = await this.storage.getSignedUrl(photoRecord.filePath);

    return { ...mapped, fullUrl: signedUrl };
  }

  async listPhotosForShareLink(folderId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.folderId, folderId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      );

    if (photos.length === 0) {
      return [];
    }

    const mapped = await mapPhotosToResponse(photos, this.storage);
    const withFullUrls = await Promise.all(
      mapped.map(async (m, i) => {
        const { signedUrl } = await this.storage.getSignedUrl(
          photos[i]!.filePath,
        );
        return { ...m, fullUrl: signedUrl };
      }),
    );

    return withFullUrls;
  }
}
