import { Injectable } from '@nestjs/common';
import { and, eq, exists, gt, isNull, or, SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  folderShare,
  photo,
  photoShare,
  PhotoStatusEnum,
  sharePermissionEnum,
} from '../db/schema.js';
import { Tx } from '../helpers/helpers.js';
import { PhotoNotFoundError } from './photo.errors.js';

@Injectable()
export class PhotoPermissionService {
  buildViewableCondition(userId: string, client: Tx | typeof db = db): SQL {
    return or(
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
    )!;
  }

  buildEditableCondition(userId: string, client: Tx | typeof db = db): SQL {
    return or(
      eq(photo.ownerId, userId),

      exists(
        client
          .select()
          .from(photoShare)
          .where(
            and(
              eq(photoShare.photoId, photo.id),
              eq(photoShare.sharedWithId, userId),
              eq(photoShare.permission, sharePermissionEnum.EDIT),
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
              eq(folderShare.permission, sharePermissionEnum.EDIT),
              or(
                isNull(folderShare.expiresAt),
                gt(folderShare.expiresAt, new Date()),
              ),
            ),
          ),
      ),
    )!;
  }

  async getOwnedPhotoOrThrow(userId: string, photoId: string, tx?: Tx) {
    const client = tx ?? db;

    const [photoRecord] = await client
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.ownerId, userId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      );

    if (!photoRecord) {
      throw new PhotoNotFoundError();
    }

    return photoRecord;
  }

  async getViewablePhotoOrThrow(userId: string, photoId: string, tx?: Tx) {
    const client = tx ?? db;

    const [photoRecord] = await client
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.status, PhotoStatusEnum.READY),
          this.buildViewableCondition(userId, client),
        ),
      )
      .limit(1);

    if (!photoRecord) {
      throw new PhotoNotFoundError();
    }

    return photoRecord;
  }

  async getEditablePhotoOrThrow(userId: string, photoId: string, tx?: Tx) {
    const client = tx ?? db;

    const [photoRecord] = await client
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.status, PhotoStatusEnum.READY),
          this.buildEditableCondition(userId, client),
        ),
      )
      .limit(1);

    if (!photoRecord) {
      throw new PhotoNotFoundError();
    }

    return photoRecord;
  }
}
