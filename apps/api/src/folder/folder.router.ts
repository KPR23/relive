import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { AuthMiddleware } from '../middleware.js';
import { type AuthContext } from '../trpc/context.js';
import { mapToTRPCError } from '../trpc/mapToTRPCError.js';
import { z } from 'zod';
import {
  type CreateFolderSchema,
  createFolderSchema,
  type Folder,
  folderSchema,
} from './folder.schema.js';
import { FolderService } from './folder.service.js';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'folder' })
export class FolderRouter {
  constructor(private readonly folderService: FolderService) {}

  @Query({
    output: folderSchema,
  })
  async getRootFolder(@Ctx() _ctx: AuthContext) {
    try {
      return await this.folderService.ensureRootFolder(_ctx.user.id);
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Query({
    output: z.array(folderSchema),
  })
  async getAllFolders(@Ctx() _ctx: AuthContext) {
    try {
      return await this.folderService.getAllFolders(_ctx.user.id);
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Query({
    input: z.object({ parentId: z.string() }),
    output: z.array(folderSchema),
  })
  async getFolderChildren(
    @Ctx() _ctx: AuthContext,
    @Input() data: { parentId: string },
  ) {
    try {
      return await this.folderService.getFolderChildren(
        _ctx.user.id,
        data.parentId,
      );
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Query({
    input: z.object({ folderId: z.string() }),
    output: z.array(folderSchema),
  })
  async getAllParentsForFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { folderId: string },
  ) {
    try {
      return await this.folderService.getAllParentsForFolder(
        _ctx.user.id,
        data.folderId,
      );
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Query({
    input: z
      .object({ currentFolderId: z.string().optional() })
      .optional()
      .default({}),
    output: z.array(folderSchema),
  })
  async getMoveableFolders(
    @Ctx() _ctx: AuthContext,
    @Input() data?: { currentFolderId?: string },
  ) {
    try {
      return await this.folderService.getMoveableFolders(
        _ctx.user.id,
        data?.currentFolderId,
      );
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Mutation({
    input: createFolderSchema,
    output: folderSchema,
  })
  async createFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: CreateFolderSchema,
  ): Promise<Folder> {
    try {
      return await this.folderService.createFolder(_ctx.user.id, data);
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ movingFolderId: z.string(), targetParentId: z.string() }),
  })
  async moveFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { movingFolderId: string; targetParentId: string },
  ) {
    try {
      return await this.folderService.moveFolder(
        _ctx.user.id,
        data.movingFolderId,
        data.targetParentId,
      );
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ id: z.string() }),
  })
  async deleteFolder(@Ctx() _ctx: AuthContext, @Input() data: { id: string }) {
    try {
      return await this.folderService.deleteFolder(_ctx.user.id, data.id);
    } catch (err) {
      throw mapToTRPCError(err);
    }
  }
}
