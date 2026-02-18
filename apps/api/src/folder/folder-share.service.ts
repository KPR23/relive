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
import {
  type FolderShareRecipient,
  type FolderSharedWithMe,
} from './folder.schema.js';

@Injectable()
export class FolderShareService {
  constructor(
    private readonly folderPermissionService: FolderPermissionService,
    private readonly userService: UserService,
  ) {}

  async listSharedFoldersWithMe(userId: string): Promise<FolderSharedWithMe[]> {
    const results = await db
      .select({
        folder,
        ownerName: user.name,
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
      sharedByName: r.ownerName ?? undefined,
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

      const folderRecord =
        await this.folderPermissionService.getOwnedFolderOrThrow(
          userId,
          folderId,
          tx,
        );

      if (folderRecord.isRoot === true) {
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
  ): Promise<FolderShareRecipient[]> {
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
      sharedWithId: r.share.sharedWithId,
      sharedWithEmail: r.user?.email ?? '',
      permission: r.share.permission,
      expiresAt: r.share.expiresAt,
    }));
  }
}
