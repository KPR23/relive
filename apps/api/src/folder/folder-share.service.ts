import { Injectable } from '@nestjs/common';
import { db } from '../db/index.js';
import { folderShare, SharePermission } from '../db/schema.js';
import { UserService } from '../user/user.service.js';
import { FolderPermissionService } from './folder-permission.service.js';
import {
  CannotShareRootFolderError,
  FolderAlreadySharedWithUserError,
  FolderCannotShareWithSelfError,
} from './folder.errors.js';

@Injectable()
export class FolderShareService {
  constructor(
    private readonly folderPermissionService: FolderPermissionService,
    private readonly userService: UserService,
  ) {}

  async shareFolderWithUserId(
    userId: string,
    folderId: string,
    targetUserId: string,
    permission: SharePermission,
  ) {
    return db.transaction(async (tx) => {
      if (userId === targetUserId) {
        throw new FolderCannotShareWithSelfError();
      }

      const folder = await this.folderPermissionService.getOwnedFolderOrThrow(
        userId,
        folderId,
        tx,
      );

      if (folder.isRoot === true) {
        throw new CannotShareRootFolderError();
      }

      const result = await tx
        .insert(folderShare)
        .values({
          id: crypto.randomUUID(),
          ownerId: userId,
          folderId,
          sharedWithId: targetUserId,
          permission,
        })
        .onConflictDoNothing();

      if (result.rowCount === 0) {
        throw new FolderAlreadySharedWithUserError();
      }

      return { success: true };
    });
  }

  async shareFolderWithUser(
    userId: string,
    folderId: string,
    targetUserEmail: string,
    permission: SharePermission,
  ) {
    const targetUser = await this.userService.getUserByEmail(targetUserEmail);

    return this.shareFolderWithUserId(
      userId,
      folderId,
      targetUser.id,
      permission,
    );
  }
}
