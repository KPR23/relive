import { Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import {
  folder,
  folderShare,
  SharePermission,
  sharePermissionEnum,
  user,
} from '../db/schema.js';
import { UserService } from '../user/user.service.js';
import { FolderPermissionService } from './folder-permission.service.js';
import {
  CannotShareRootFolderError,
  FolderAlreadySharedWithUserError,
  FolderCannotShareWithSelfError,
} from './folder.errors.js';
import { FolderShareListItem } from './folder.schema.js';

@Injectable()
export class FolderShareService {
  constructor(
    private readonly folderPermissionService: FolderPermissionService,
    private readonly userService: UserService,
  ) {}

  async listSharedFoldersWithMe(
    userId: string,
  ): Promise<FolderShareListItem[]> {
    const results = await db
      .select({
        folder,
        ownerEmail: user.email,
      })
      .from(folder)
      .leftJoin(user, eq(folder.ownerId, user.id))
      .where(
        and(
          eq(folder.isRoot, false),
          this.folderPermissionService.buildViewableCondition(userId),
          ne(folder.ownerId, userId),
        ),
      );

    return results.map((r) => ({
      id: r.folder.id,
      folderId: r.folder.id,
      folderName: r.folder.name,
      sharedByUserId: r.folder.ownerId,
      sharedBy: r.ownerEmail ?? '',
      permission: sharePermissionEnum.VIEW,
      expiresAt: null,
    }));
  }

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

  async listFolderShares(
    userId: string,
    folderId: string,
  ): Promise<FolderShareListItem[]> {
    const results = await db
      .select({
        share: folderShare,
        folder: folder,
        user: { id: user.id, email: user.email },
      })
      .from(folderShare)
      .innerJoin(folder, eq(folderShare.folderId, folder.id))
      .innerJoin(user, eq(folderShare.sharedWithId, user.id))
      .where(
        and(
          eq(folderShare.folderId, folderId),
          eq(folderShare.ownerId, userId),
        ),
      );

    return results.map((r) => ({
      id: r.share.id,
      folderId: r.share.folderId,
      folderName: r.folder.name,
      sharedByUserId: r.folder.ownerId,
      sharedBy: r.user?.email ?? '',
      permission: r.share.permission,
      expiresAt: r.share.expiresAt,
    }));
  }
}
