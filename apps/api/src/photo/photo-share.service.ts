import { Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  photo,
  photoShare,
  PhotoStatusEnum,
  SharePermission,
  user,
} from '../db/schema.js';
import { mapPhotosToResponse } from '../helpers/helpers.js';
import { StorageService } from '../storage/storage.service.js';
import { UserService } from '../user/user.service.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import {
  PhotoAlreadySharedWithUserError,
  PhotoCannotShareWithSelfError,
  PhotoShareNotFoundError,
} from './photo.errors.js';
import { PhotoShareListItem } from './photo.schema.js';

@Injectable()
export class PhotoShareService {
  constructor(
    private readonly storage: StorageService,
    private readonly photoPermissionService: PhotoPermissionService,
    private readonly userService: UserService,
  ) {}

  async sharedPhotosWithMe(userId: string) {
    const rows = await db
      .select({
        photo,
        ownerName: user.name,
      })
      .from(photo)
      .leftJoin(user, eq(photo.ownerId, user.id))
      .where(
        and(
          eq(photo.status, PhotoStatusEnum.READY),
          this.photoPermissionService.buildViewableCondition(userId),
          ne(photo.ownerId, userId),
        ),
      );

    const photos = await mapPhotosToResponse(
      rows.map((r) => r.photo),
      this.storage,
    );

    return {
      photos: photos.map((p, i) => ({
        ...p,
        ownerName: rows[i]?.ownerName ?? null,
      })),
    };
  }

  private async sharePhotoWithUserId(
    userId: string,
    photoId: string,
    targetUserId: string,
    permission: SharePermission,
    expiresAt?: Date,
  ) {
    return db.transaction(async (tx) => {
      if (userId === targetUserId) {
        throw new PhotoCannotShareWithSelfError();
      }

      await this.photoPermissionService.getOwnedPhotoOrThrow(
        userId,
        photoId,
        tx,
      );

      const finalExpiresAt =
        expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

      const result = await tx
        .insert(photoShare)
        .values({
          id: crypto.randomUUID(),
          ownerId: userId,
          photoId: photoId,
          sharedWithId: targetUserId,
          permission: permission,
          expiresAt: finalExpiresAt,
        })
        .onConflictDoNothing();

      if (result.rowCount === 0) {
        throw new PhotoAlreadySharedWithUserError();
      }

      return { success: true };
    });
  }

  async sharePhotoWithUser(
    userId: string,
    photoId: string,
    targetUserEmail: string,
    permission: SharePermission,
    expiresAt?: Date,
  ) {
    const targetUser = await this.userService.getUserByEmail(targetUserEmail);

    return this.sharePhotoWithUserId(
      userId,
      photoId,
      targetUser.id,
      permission,
      expiresAt,
    );
  }

  async listPhotoShares(
    userId: string,
    photoId: string,
  ): Promise<PhotoShareListItem[]> {
    const results = await db
      .select({
        share: photoShare,
        user: { id: user.id, email: user.email },
      })
      .from(photoShare)
      .innerJoin(user, eq(photoShare.sharedWithId, user.id))
      .where(
        and(eq(photoShare.photoId, photoId), eq(photoShare.ownerId, userId)),
      );

    return results.map((r) => ({
      id: r.share.id,
      sharedWithId: r.share.sharedWithId,
      sharedWithEmail: r.user?.email ?? '',
      permission: r.share.permission,
      expiresAt: r.share.expiresAt,
    }));
  }

  async revokePhotoShare(
    userId: string,
    photoId: string,
    targetUserId: string,
  ) {
    return db.transaction(async (tx) => {
      await this.photoPermissionService.getOwnedPhotoOrThrow(
        userId,
        photoId,
        tx,
      );

      const result = await tx
        .delete(photoShare)
        .where(
          and(
            eq(photoShare.photoId, photoId),
            eq(photoShare.sharedWithId, targetUserId),
          ),
        );

      if (result.rowCount === 0) {
        throw new PhotoShareNotFoundError();
      }

      return { success: true };
    });
  }

  async createShareLink() {}
}
