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
import { mapToTRPCError } from '../trpc/map-to-trpc.js';
import { z } from 'zod';
import {
  type CreateFolderSchema,
  createFolderSchema,
  type DeleteFolderInputSchema,
  deleteFolderInputSchema,
  type Folder,
  folderSchema,
  type FolderIdInputSchema,
  folderIdInputSchema,
  type GetMoveableFoldersInputSchema,
  getMoveableFoldersInputSchema,
  type MoveFolderInputSchema,
  moveFolderInputSchema,
  type ParentIdInputSchema,
  parentIdInputSchema,
  shareFolderWithUserInputSchema,
  type ShareFolderWithUserInputSchema,
  folderShareListItemSchema,
  FolderShareListItem,
} from './folder.schema.js';
import { FolderService } from './folder.service.js';
import { FolderShareService } from './folder-share.service.js';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'folder' })
export class FolderRouter {
  constructor(
    private readonly folderService: FolderService,
    private readonly folderShareService: FolderShareService,
  ) {}

  @Query({
    output: folderSchema,
  })
  async getRootFolder(@Ctx() _ctx: AuthContext) {
    try {
      return await this.folderService.ensureRootFolder(_ctx.user.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    output: z.array(folderSchema),
  })
  async getAllFolders(@Ctx() _ctx: AuthContext) {
    try {
      return await this.folderService.getAllFolders(_ctx.user.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: parentIdInputSchema,
    output: z.array(folderSchema),
  })
  async getFolderChildren(
    @Ctx() _ctx: AuthContext,
    @Input() data: ParentIdInputSchema,
  ) {
    try {
      return await this.folderService.getFolderChildren(
        _ctx.user.id,
        data.parentId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: folderIdInputSchema,
    output: z.array(folderSchema),
  })
  async getAllParentsForFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: FolderIdInputSchema,
  ) {
    try {
      return await this.folderService.getAllParentsForFolder(
        _ctx.user.id,
        data.folderId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: getMoveableFoldersInputSchema,
    output: z.array(folderSchema),
  })
  async getMoveableFolders(
    @Ctx() _ctx: AuthContext,
    @Input() data: GetMoveableFoldersInputSchema,
  ) {
    try {
      return await this.folderService.getMoveableFolders(
        _ctx.user.id,
        data?.currentFolderId,
      );
    } catch (err) {
      mapToTRPCError(err);
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
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: moveFolderInputSchema,
  })
  async moveFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: MoveFolderInputSchema,
  ) {
    try {
      return await this.folderService.moveFolder(
        _ctx.user.id,
        data.movingFolderId,
        data.targetParentId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: deleteFolderInputSchema,
  })
  async deleteFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: DeleteFolderInputSchema,
  ) {
    try {
      return await this.folderService.deleteFolder(_ctx.user.id, data.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: shareFolderWithUserInputSchema,
    output: z.object({ success: z.literal(true) }),
  })
  async shareFolderWithUser(
    @Ctx() _ctx: AuthContext,
    @Input() data: ShareFolderWithUserInputSchema,
  ) {
    try {
      return await this.folderShareService.shareFolderWithUser(
        _ctx.user.id,
        data.folderId,
        data.targetUserEmail,
        data.permission,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: folderIdInputSchema,
    output: z.array(folderShareListItemSchema),
  })
  async listFolderShares(
    @Ctx() _ctx: AuthContext,
    @Input() data: FolderIdInputSchema,
  ) {
    try {
      return await this.folderShareService.listFolderShares(
        _ctx.user.id,
        data.folderId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    output: z.array(folderShareListItemSchema),
  })
  async listSharedFoldersWithMe(
    @Ctx() _ctx: AuthContext,
  ): Promise<FolderShareListItem[]> {
    try {
      return await this.folderShareService.listSharedFoldersWithMe(
        _ctx.user.id,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }
}
