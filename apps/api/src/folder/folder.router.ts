import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { AuthMiddleware } from 'src/middleware';
import { B2Storage } from 'src/storage/b2.storage';
import { FolderService } from './folder.service';
import { type AuthContext } from 'src/trpc/context';
import { type CreateFolderSchema } from './folder.schema';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'folder' })
export class FolderRouter {
  constructor(
    private readonly storage: B2Storage,
    private readonly folderService: FolderService,
  ) {}

  @Query()
  async getRootFolder(@Ctx() _ctx: AuthContext) {
    return this.folderService.ensureRootFolder(_ctx.user.id);
  }

  @Query()
  async getFolderChildren(
    @Ctx() _ctx: AuthContext,
    @Input() data: { parentId: string },
  ) {
    return this.folderService.getFolderChildren(_ctx.user.id, data.parentId);
  }

  @Mutation()
  async createFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: CreateFolderSchema,
  ) {
    if (data.id) return this.folderService.createFolder(_ctx.user.id, data);
  }

  @Mutation()
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

  @Mutation()
  async deleteFolder(@Ctx() _ctx: AuthContext, @Input() data: { id: string }) {
    return this.folderService.deleteFolder(_ctx.user.id, data.id);
  }
}
