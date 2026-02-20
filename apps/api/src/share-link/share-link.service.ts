import { Injectable } from '@nestjs/common';
import { and, eq, isNotNull } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  folderShareLink,
  photoShareLink,
  type SharePermission,
} from '../db/schema.js';
import { FolderPermissionService } from '../folder/folder-permission.service.js';
import { hashPassword, verifyPassword } from '../helpers/password.js';
import { PhotoPermissionService } from '../photo/photo-permission.service.js';
import {
  ShareLinkCreationFailedError,
  ShareLinkExpiredError,
  ShareLinkNotFoundError,
  ShareLinkNotOwnedByUserError,
  ShareLinkPasswordInvalidError,
} from './share-link.errors.js';
import type {
  CreateShareLinkOutputSchema,
  GetShareLinkByTokenResponse,
  ShareLinkByToken,
} from './share-link.schema.js';

@Injectable()
export class ShareLinkService {
  constructor(
    private readonly photoPermissionService: PhotoPermissionService,
    private readonly folderPermissionService: FolderPermissionService,
  ) {}

  async createPhotoLink(
    userId: string,
    photoId: string,
    permission: SharePermission,
    expiresAt: Date,
    password?: string,
  ): Promise<CreateShareLinkOutputSchema> {
    await this.photoPermissionService.getOwnedPhotoOrThrow(userId, photoId);

    const passwordHash = password ? await hashPassword(password) : undefined;

    const [created] = await db
      .insert(photoShareLink)
      .values({
        photoId,
        permission,
        expiresAt,
        passwordHash,
        createdBy: userId,
      })
      .returning({
        token: photoShareLink.token,
        expiresAt: photoShareLink.expiresAt,
        createdBy: photoShareLink.createdBy,
      });

    if (!created) throw new ShareLinkCreationFailedError();

    return {
      token: created.token,
      expiresAt: created.expiresAt,
      createdBy: created.createdBy,
    };
  }

  async createFolderLink(
    userId: string,
    folderId: string,
    permission: SharePermission,
    expiresAt: Date,
    password?: string,
  ): Promise<CreateShareLinkOutputSchema> {
    await this.folderPermissionService.getOwnedFolderOrThrow(userId, folderId);

    const passwordHash = password ? await hashPassword(password) : undefined;

    const [created] = await db
      .insert(folderShareLink)
      .values({
        folderId,
        permission,
        expiresAt,
        passwordHash,
        createdBy: userId,
      })
      .returning({
        token: folderShareLink.token,
        expiresAt: folderShareLink.expiresAt,
        createdBy: folderShareLink.createdBy,
      });

    if (!created) throw new ShareLinkCreationFailedError();

    return {
      token: created.token,
      expiresAt: created.expiresAt,
      createdBy: created.createdBy,
    };
  }

  private async findLinkByTokenOrThrow(
    token: string,
  ): Promise<ShareLinkByToken> {
    const [photoLink] = await db
      .select({
        photoId: photoShareLink.photoId,
        permission: photoShareLink.permission,
        expiresAt: photoShareLink.expiresAt,
        revokedAt: photoShareLink.revokedAt,
        passwordHash: photoShareLink.passwordHash,
        createdBy: photoShareLink.createdBy,
      })
      .from(photoShareLink)
      .where(eq(photoShareLink.token, token));

    if (photoLink) {
      return { type: 'photo', ...photoLink };
    }

    const [folderLink] = await db
      .select({
        folderId: folderShareLink.folderId,
        permission: folderShareLink.permission,
        expiresAt: folderShareLink.expiresAt,
        revokedAt: folderShareLink.revokedAt,
        passwordHash: folderShareLink.passwordHash,
        createdBy: folderShareLink.createdBy,
      })
      .from(folderShareLink)
      .where(eq(folderShareLink.token, token));

    if (!folderLink) {
      throw new ShareLinkNotFoundError();
    }

    return { type: 'folder', ...folderLink };
  }

  async getByToken(
    token: string,
    password?: string,
  ): Promise<GetShareLinkByTokenResponse> {
    const link = await this.findLinkByTokenOrThrow(token);

    if (link.revokedAt || (link.expiresAt && link.expiresAt < new Date())) {
      throw new ShareLinkExpiredError();
    }

    const requiresPassword = !!link.passwordHash;

    if (requiresPassword) {
      if (!password) {
        return { requiresPassword: true, type: link.type };
      }

      const isPasswordValid = await verifyPassword(
        password,
        link.passwordHash as string,
      );
      if (!isPasswordValid) {
        throw new ShareLinkPasswordInvalidError();
      }
    }

    const resourceId = link.type === 'photo' ? link.photoId : link.folderId;
    return {
      requiresPassword: false,
      resourceId,
      type: link.type,
      permission: link.permission,
    };
  }

  async revokeLink(userId: string, token: string) {
    const link = await this.findLinkByTokenOrThrow(token);

    if (link.createdBy !== userId) {
      throw new ShareLinkNotOwnedByUserError();
    }

    const table = link.type === 'photo' ? photoShareLink : folderShareLink;

    return db
      .update(table)
      .set({ revokedAt: new Date() })
      .where(eq(table.token, token));
  }

  async listLinksForPhoto(userId: string, photoId: string) {
    return db
      .select({
        id: photoShareLink.id,
        token: photoShareLink.token,
        expiresAt: photoShareLink.expiresAt,
        revokedAt: photoShareLink.revokedAt,
        permission: photoShareLink.permission,
        createdAt: photoShareLink.createdAt,
        hasPassword: isNotNull(photoShareLink.passwordHash),
      })
      .from(photoShareLink)
      .where(
        and(
          eq(photoShareLink.photoId, photoId),
          eq(photoShareLink.createdBy, userId),
        ),
      );
  }

  async listLinksForFolder(userId: string, folderId: string) {
    return db
      .select({
        id: folderShareLink.id,
        token: folderShareLink.token,
        expiresAt: folderShareLink.expiresAt,
        revokedAt: folderShareLink.revokedAt,
        permission: folderShareLink.permission,
        createdAt: folderShareLink.createdAt,
        hasPassword: isNotNull(folderShareLink.passwordHash),
      })
      .from(folderShareLink)
      .where(
        and(
          eq(folderShareLink.folderId, folderId),
          eq(folderShareLink.createdBy, userId),
        ),
      );
  }
}
