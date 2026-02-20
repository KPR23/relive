import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import { ShareLinkService } from './share-link.service.js';
import {
  type CreateFolderShareLinkInputSchema,
  type CreatePhotoShareLinkInputSchema,
  createFolderShareLinkInputSchema,
  createPhotoShareLinkInputSchema,
  createShareLinkOutputSchema,
  getByTokenInputSchema,
} from './share-link.schema.js';
import type { AuthContext } from '../trpc/context.js';
import { mapToTRPCError } from '../trpc/map-to-trpc.js';
import { AuthMiddleware } from '../auth/middleware.js';
import { PhotoService } from '../photo/photo.service.js';
import { FolderService } from '../folder/folder.service.js';

@Router({ alias: 'share' })
export class ShareLinkRouter {
  constructor(
    private readonly shareLinkService: ShareLinkService,
    private readonly photoService: PhotoService,
    private readonly folderService: FolderService,
  ) {}

  @Mutation({
    input: createPhotoShareLinkInputSchema,
    output: createShareLinkOutputSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async createPhotoShareLink(
    @Ctx() _ctx: AuthContext,
    @Input() data: CreatePhotoShareLinkInputSchema,
  ) {
    try {
      return await this.shareLinkService.createPhotoLink(
        _ctx.user.id,
        data.photoId,
        data.permission,
        data.expiresAt,
        data.password,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: createFolderShareLinkInputSchema,
    output: createShareLinkOutputSchema,
  })
  @UseMiddlewares(AuthMiddleware)
  async createFolderShareLink(
    @Ctx() _ctx: AuthContext,
    @Input() data: CreateFolderShareLinkInputSchema,
  ) {
    try {
      return await this.shareLinkService.createFolderLink(
        _ctx.user.id,
        data.folderId,
        data.permission,
        data.expiresAt,
        data.password,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({ input: getByTokenInputSchema })
  async getSharedContent(@Input() data: { token: string; password?: string }) {
    try {
      const link = await this.shareLinkService.getByToken(
        data.token,
        data.password,
      );

      if (link.requiresPassword) {
        return { requiresPassword: true, type: link.type };
      }

      if (link.type === 'photo') {
        const photoData = await this.photoService.getPhotoForShareLink(
          link.resourceId,
        );
        return { requiresPassword: false, type: 'photo', data: photoData };
      }

      if (link.type === 'folder') {
        const folderData = await this.folderService.getFolderForShareLink(
          link.resourceId,
        );

        const photos = await this.photoService.listPhotosForShareLink(
          link.resourceId,
        );

        return {
          requiresPassword: false,
          type: 'folder',
          data: { ...folderData, photos },
        };
      }
    } catch (err) {
      mapToTRPCError(err);
    }
  }
}
