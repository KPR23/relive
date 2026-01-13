import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { folder } from 'src/db/schema';
import { CreateFolderSchema, Folder } from './folder.schema';

@Injectable()
export class FolderService {
  async getFolderById(userId: string, id: string) {
    const [folderRecord] = await db
      .select()
      .from(folder)
      .where(and(eq(folder.id, id), eq(folder.ownerId, userId)));

    return folderRecord;
  }

  async getOwnedFolderOrThrow(userId: string, folderId: string) {
    const folder = await this.getFolderById(userId, folderId);

    if (!folder || folder.ownerId !== userId) {
      throw new Error('Folder not found or not owned by user');
    }

    return folder;
  }

  async getParent(userId: string, folderId: string) {
    const folder = await this.getOwnedFolderOrThrow(userId, folderId);
    if (!folder.parentId) {
      return null;
    }

    const parentFolder = await this.getOwnedFolderOrThrow(
      userId,
      folder.parentId,
    );
    return parentFolder;
  }

  async ensureRootFolder(userId: string) {
    const [root] = await db
      .select()
      .from(folder)
      .where(and(eq(folder.ownerId, userId), eq(folder.isRoot, true)));

    if (root) return root;

    const [created] = await db
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

  async getFolderChildren(userId: string, parentId: string) {
    return db
      .select()
      .from(folder)
      .where(and(eq(folder.ownerId, userId), eq(folder.parentId, parentId)));
  }

  async createFolder(userId: string, data: CreateFolderSchema) {
    await this.ensureRootFolder(userId);
    if (!data.parentId) {
      throw new Error('Parent folder ID not provided');
    }
    const parentFolder = await this.getOwnedFolderOrThrow(
      userId,
      data.parentId,
    );

    return db
      .insert(folder)
      .values({ ...data, ownerId: userId })
      .returning();
  }

  async moveFolder(
    userId: string,
    movingFolderId: string,
    targetParentId: string,
  ) {
    const movingFolder = await this.getOwnedFolderOrThrow(
      userId,
      movingFolderId,
    );
    const targetFolder = await this.getOwnedFolderOrThrow(
      userId,
      targetParentId,
    );

    if (targetParentId === movingFolderId || movingFolder.isRoot === true) {
      throw new Error('Cannot move this folder');
    }

    let current = targetFolder;
    while (current.parentId) {
      const parent = await this.getParent(userId, current.parentId);
      if (!parent) break;
      if (parent.id === movingFolder.id) {
        throw new Error('Cannot move this folder');
      }
      current = parent;
    }

    return db
      .update(folder)
      .set({ parentId: targetParentId })
      .where(eq(folder.id, movingFolderId));
  }

  async deleteFolder(userId: string, id: string) {
    const targetFolder = await this.getOwnedFolderOrThrow(userId, id);

    if (targetFolder.isRoot) {
      throw new Error('Cannot delete root folder');
    }

    const children = await this.getFolderChildren(userId, id);

    if (children.length > 0) {
      throw new Error('Cannot delete folder with children');
    }

    return db.delete(folder).where(eq(folder.id, id));
  }
}
