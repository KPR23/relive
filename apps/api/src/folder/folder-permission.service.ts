import { Injectable } from '@nestjs/common';
import { and, eq, exists, gt, isNull, or, SQL } from 'drizzle-orm';
import { db } from '../db/index.js';
import { folder, folderShare, sharePermissionEnum } from '../db/schema.js';
import { Tx } from '../helpers/helpers.js';
import { FolderNotFoundError } from './folder.errors.js';

@Injectable()
export class FolderPermissionService {
  buildViewableCondition(userId: string, client: Tx | typeof db = db): SQL {
    return or(
      eq(folder.ownerId, userId),

      exists(
        client
          .select()
          .from(folderShare)
          .where(
            and(
              eq(folderShare.folderId, folder.id),
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
      eq(folder.ownerId, userId),

      exists(
        client
          .select()
          .from(folderShare)
          .where(
            and(
              eq(folderShare.folderId, folder.id),
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

  async getOwnedFolderOrThrow(userId: string, folderId: string, tx?: Tx) {
    const client = tx ?? db;

    const [folderRecord] = await client
      .select()
      .from(folder)
      .where(and(eq(folder.id, folderId), eq(folder.ownerId, userId)));

    if (!folderRecord) {
      throw new FolderNotFoundError();
    }

    return folderRecord;
  }

  async getViewableFolderOrThrow(userId: string, folderId: string, tx?: Tx) {
    const folderRecord = await this.getViewableFolder(userId, folderId, tx);
    if (!folderRecord) {
      throw new FolderNotFoundError();
    }
    return folderRecord;
  }

  async getViewableFolder(
    userId: string,
    folderId: string,
    tx?: Tx,
  ): Promise<typeof folder.$inferSelect | undefined> {
    const client = tx ?? db;

    const [folderRecord] = await client
      .select()
      .from(folder)
      .where(
        and(
          eq(folder.id, folderId),
          this.buildViewableCondition(userId, client),
        ),
      )
      .limit(1);

    return folderRecord;
  }

  async getEditableFolderOrThrow(userId: string, folderId: string, tx?: Tx) {
    const client = tx ?? db;

    const [folderRecord] = await client
      .select()
      .from(folder)
      .where(
        and(
          eq(folder.id, folderId),
          this.buildEditableCondition(userId, client),
        ),
      )
      .limit(1);

    if (!folderRecord) {
      throw new FolderNotFoundError();
    }

    return folderRecord;
  }
}
