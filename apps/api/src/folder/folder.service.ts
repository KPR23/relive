import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { folder } from 'src/db/schema';
import { CreateFolderSchema, Folder } from './folder.schema';

type Tx = Parameters<typeof db.transaction>[0] extends (tx: infer T) => any
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

    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.ownerId !== userId) {
      throw new ForbiddenException('Folder not owned by user');
    }

    return folder;
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

  async ensureRootFolder(userId: string) {
    return db.transaction(async (tx) => {
      const [root] = await tx
        .select()
        .from(folder)
        .where(and(eq(folder.ownerId, userId), eq(folder.isRoot, true)));

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
      throw new BadRequestException('Parent folder ID not provided');
    }
    await this.getOwnedFolderOrThrow(userId, data.parentId);

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
        throw new BadRequestException('Cannot move this folder');

      if (movingFolder.isRoot === true)
        throw new ForbiddenException('Cannot move root folder');

      let current = targetFolder;
      while (current.parentId) {
        const parent = await this.getParent(userId, current, tx);
        if (!parent) break;
        if (parent.id === movingFolder.id) {
          throw new ConflictException('Cannot move this folder');
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
        throw new ForbiddenException('Cannot delete root folder');
      }

      const children = await this.getFolderChildren(userId, id, tx);

      if (children.length > 0) {
        throw new ConflictException('Cannot delete folder with children');
      }

      return tx.delete(folder).where(eq(folder.id, id));
    });
  }
}
