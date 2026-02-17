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
import { B2Storage } from '../storage/b2.storage.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import {
  PhotoAlreadySharedWithUserError,
  PhotoCannotShareWithSelfError,
  UserNotFoundError,
} from './photo.errors.js';
import { PhotoShareListItem } from './photo.schema.js';

@Injectable()
export class PhotoShareService {
  constructor(
    private readonly storage: B2Storage,
    private readonly photoPermissionService: PhotoPermissionService,
  ) {}

  async sharedPhotosWithMe(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.status, PhotoStatusEnum.READY),
          this.photoPermissionService.buildViewableCondition(userId),
          ne(photo.ownerId, userId),
        ),
      );

    return mapPhotosToResponse(photos, this.storage);
  }

  private async sharePhotoWithUserId(
    userId: string,
    photoId: string,
    targetUserId: string,
    permission: SharePermission,
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

      const result = await tx
        .insert(photoShare)
        .values({
          id: crypto.randomUUID(),
          ownerId: userId,
          photoId: photoId,
          sharedWithId: targetUserId,
          permission: permission,
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
  ) {
    const [targetUser] = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(eq(user.email, targetUserEmail))
      .limit(1);

    if (!targetUser) {
      throw new UserNotFoundError('Target user not found');
    }

    return this.sharePhotoWithUserId(
      userId,
      photoId,
      targetUser.id,
      permission,
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

      await tx
        .delete(photoShare)
        .where(
          and(
            eq(photoShare.photoId, photoId),
            eq(photoShare.sharedWithId, targetUserId),
          ),
        );
    });
  }
}
