import { Injectable } from '@nestjs/common';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '../db/index.js';
import { folder } from '../db/schema.js';
import {
  CannotDeleteFolderWithChildrenError,
  CannotDeleteRootFolderError,
  CannotMoveFolderCreatesCycleError,
  CannotMoveFolderToSelfError,
  CannotMoveRootFolderError,
  FolderNotFoundError,
  ParentFolderIdRequiredError,
} from './folder.errors.js';
import { CreateFolderSchema, Folder } from './folder.schema.js';

export type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => any
  ? T
  : never;
@Injectable()
export class FolderService {
  async getFolderById(userId: string, id: string, tx?: Tx) {
    const client = tx ?? db;
    const [folderRecord] = await client
      .select()
      .from(folder)
      .where(and(eq(folder.id, id), eq(folder.ownerId, userId)));

    return folderRecord;
  }

  async getOwnedFolderOrThrow(userId: string, folderId: string, tx?: Tx) {
    const folder = await this.getFolderById(userId, folderId, tx);

    if (!folder) throw new FolderNotFoundError();

    return folder;
  }

  async getAllFolders(userId: string, tx?: Tx) {
    const client = tx ?? db;
    return client.select().from(folder).where(eq(folder.ownerId, userId));
  }

  async getMoveableFolders(userId: string, currentFolderId?: string, tx?: Tx) {
    const client = tx ?? db;
    const conditions = [eq(folder.ownerId, userId), eq(folder.isRoot, false)];

    if (currentFolderId) {
      conditions.push(ne(folder.id, currentFolderId));
    }

    return client
      .select()
      .from(folder)
      .where(and(...conditions))
      .orderBy(folder.name);
  }

  async getParent(userId: string, folder: Folder, tx?: Tx) {
    if (!folder.parentId) {
      return null;
    }

    const parentFolder = await this.getOwnedFolderOrThrow(
      userId,
      folder.parentId,
      tx,
    );

    return parentFolder;
  }

  async getAllParentsForFolder(userId: string, folderId: string, tx?: Tx) {
    const folderRecord = await this.getOwnedFolderOrThrow(userId, folderId, tx);

    const parents: Folder[] = [];
    let current = folderRecord;
    parents.push(current);
    while (current.parentId) {
      const parentFolder = await this.getOwnedFolderOrThrow(
        userId,
        current.parentId,
        tx,
      );
      parents.unshift(parentFolder);
      current = parentFolder;
    }

    return parents;
  }

  async ensureRootFolder(userId: string, tx?: Tx) {
    if (tx) {
      const [root] = await tx
        .select()
        .from(folder)
        .where(and(eq(folder.ownerId, userId), eq(folder.isRoot, true)))
        .limit(1);

      if (root) return root;

      const [created] = await tx
        .insert(folder)
        .values({
          ownerId: userId,
          name: 'My Photos',
          isRoot: true,
          parentId: null,
        })
        .returning();

      return created;
    }

    return db.transaction(async (transaction) => {
      const [root] = await transaction
        .select()
        .from(folder)
        .where(and(eq(folder.ownerId, userId), eq(folder.isRoot, true)))
        .limit(1);

      if (root) return root;

      const [created] = await transaction
        .insert(folder)
        .values({
          ownerId: userId,
          name: 'My Photos',
          isRoot: true,
          parentId: null,
        })
        .returning();

      return created;
    });
  }

  async getFolderChildren(userId: string, parentId: string, tx?: Tx) {
    const client = tx ?? db;
    return client
      .select()
      .from(folder)
      .where(and(eq(folder.ownerId, userId), eq(folder.parentId, parentId)));
  }

  async createFolder(userId: string, data: CreateFolderSchema) {
    await this.ensureRootFolder(userId);

    if (!data.parentId) {
      throw new ParentFolderIdRequiredError();
    }
    await this.getOwnedFolderOrThrow(userId, data.parentId);

    const [created] = await db
      .insert(folder)
      .values({ ...data, ownerId: userId })
      .returning();
    return created;
  }

  async moveFolder(
    userId: string,
    movingFolderId: string,
    targetParentId: string,
  ) {
    return db.transaction(async (tx) => {
      const movingFolder = await this.getOwnedFolderOrThrow(
        userId,
        movingFolderId,
        tx,
      );
      const targetFolder = await this.getOwnedFolderOrThrow(
        userId,
        targetParentId,
        tx,
      );

      if (targetParentId === movingFolderId)
        throw new CannotMoveFolderToSelfError();

      if (movingFolder.isRoot === true) throw new CannotMoveRootFolderError();

      let current = targetFolder;
      while (current.parentId) {
        const parent = await this.getParent(userId, current, tx);
        if (!parent) break;
        if (parent.id === movingFolder.id) {
          throw new CannotMoveFolderCreatesCycleError();
        }
        current = parent;
      }

      return tx
        .update(folder)
        .set({ parentId: targetParentId })
        .where(eq(folder.id, movingFolderId));
    });
  }

  async deleteFolder(userId: string, id: string) {
    return db.transaction(async (tx) => {
      const targetFolder = await this.getOwnedFolderOrThrow(userId, id, tx);

      if (targetFolder.isRoot) {
        throw new CannotDeleteRootFolderError();
      }

      const children = await this.getFolderChildren(userId, id, tx);

      if (children.length > 0) {
        throw new CannotDeleteFolderWithChildrenError();
      }

      return tx.delete(folder).where(eq(folder.id, id));
    });
  }
}
