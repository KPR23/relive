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
    return this.folderService.ensureRootFolder(_ctx.user.id);
  }

  @Query({
    output: z.array(folderSchema),
  })
  async getAllFolders(@Ctx() _ctx: AuthContext) {
    return this.folderService.getAllFolders(_ctx.user.id);
  }

  @Query({
    input: z.object({ parentId: z.string() }),
    output: z.array(folderSchema),
  })
  async getFolderChildren(
    @Ctx() _ctx: AuthContext,
    @Input() data: { parentId: string },
  ) {
    return this.folderService.getFolderChildren(_ctx.user.id, data.parentId);
  }

  @Query({
    input: z.object({ folderId: z.string() }),
    output: z.array(folderSchema),
  })
  async getAllParentsForFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { folderId: string },
  ) {
    return this.folderService.getAllParentsForFolder(
      _ctx.user.id,
      data.folderId,
    );
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
    return this.folderService.getMoveableFolders(
      _ctx.user.id,
      data?.currentFolderId,
    );
  }

  @Mutation({
    input: createFolderSchema,
    output: folderSchema,
  })
  async createFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: CreateFolderSchema,
  ): Promise<Folder> {
    return this.folderService.createFolder(_ctx.user.id, data);
  }

  @Mutation({
    input: z.object({ movingFolderId: z.string(), targetParentId: z.string() }),
  })
  async moveFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { movingFolderId: string; targetParentId: string },
  ) {
    return this.folderService.moveFolder(
      _ctx.user.id,
      data.movingFolderId,
      data.targetParentId,
    );
  }

  @Mutation({
    input: z.object({ id: z.string() }),
  })
  async deleteFolder(@Ctx() _ctx: AuthContext, @Input() data: { id: string }) {
    return this.folderService.deleteFolder(_ctx.user.id, data.id);
  }
}
