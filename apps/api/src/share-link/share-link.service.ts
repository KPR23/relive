import { Injectable } from '@nestjs/common';
import { db } from '../db/index.js';
import {
  folderShareLink,
  photoShareLink,
  type SharePermission,
} from '../db/schema.js';
import { hashPassword } from '../helpers/password.js';
import { FolderPermissionService } from '../folder/folder-permission.service.js';
import { PhotoPermissionService } from '../photo/photo-permission.service.js';
import { ShareLinkCreationFailedError } from './share-link.errors.js';
import type { CreateShareLinkOutputSchema } from './share-link.schema.js';

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

  // getByToken(token: string) {}

  // verifyPassword(token: string, password: string) {}

  // revokeLink(linkId: string) {}

  // listLinksForPhoto(photoId: string) {}
  // listLinksForFolder(folderId: string) {}
}
