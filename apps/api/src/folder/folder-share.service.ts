import { Injectable } from '@nestjs/common';
import { and, eq, gt, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import { folder, folderShare, SharePermission, user } from '../db/schema.js';
import { UserService } from '../user/user.service.js';
import { FolderPermissionService } from './folder-permission.service.js';
import {
  CannotShareRootFolderError,
  FolderAlreadySharedWithUserError,
  FolderCannotShareWithSelfError,
  FolderShareNotFoundError,
} from './folder.errors.js';
import {
  type FolderSharedWithMe,
  type FolderShareRecipient,
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
        permission: folderShare.permission,
        expiresAt: folderShare.expiresAt,
      })
      .from(folder)
      .innerJoin(
        folderShare,
        and(
          eq(folderShare.folderId, folder.id),
          eq(folderShare.sharedWithId, userId),
          gt(folderShare.expiresAt, new Date()),
        ),
      )
      .leftJoin(user, eq(folder.ownerId, user.id))
      .where(and(eq(folder.isRoot, false), ne(folder.ownerId, userId)));

    return results.map((r) => ({
      id: r.folder.id,
      folderId: r.folder.id,
      folderName: r.folder.name,
      sharedByName: r.ownerName ?? undefined,
      permission: r.permission,
      expiresAt: r.expiresAt,
    }));
  }

  async shareFolderWithUserId(
    userId: string,
    folderId: string,
    targetUserId: string,
    permission: SharePermission,
    expiresAt: Date,
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
          folderId,
          sharedWithId: targetUserId,
          permission,
          expiresAt,
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
    expiresAt: Date,
  ) {
    const targetUser = await this.userService.getUserByEmail(targetUserEmail);

    return this.shareFolderWithUserId(
      userId,
      folderId,
      targetUser.id,
      permission,
      expiresAt,
    );
  }

  async revokeFolderShare(
    userId: string,
    folderId: string,
    targetUserId: string,
  ) {
    return db.transaction(async (tx) => {
      await this.folderPermissionService.getOwnedFolderOrThrow(
        userId,
        folderId,
        tx,
      );

      const result = await tx
        .delete(folderShare)
        .where(
          and(
            eq(folderShare.folderId, folderId),
            eq(folderShare.sharedWithId, targetUserId),
          ),
        );

      if (result.rowCount === 0) {
        throw new FolderShareNotFoundError();
      }

      return { success: true };
    });
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
        and(eq(folderShare.folderId, folderId), eq(folder.ownerId, userId)),
      );

    const now = new Date();

    return results.map((r) => ({
      id: r.share.id,
      folderId: r.share.folderId,
      folderName: r.folder.name,
      sharedWithId: r.share.sharedWithId,
      sharedWithEmail: r.user?.email ?? '',
      permission: r.share.permission,
      status: now > r.share.expiresAt ? 'EXPIRED' : 'ACTIVE',
      expiresAt: r.share.expiresAt,
    }));
  }
}
