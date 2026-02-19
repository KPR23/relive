import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { ShareLinkService } from './share-link.service.js';
import {
  type CreateFolderShareLinkInputSchema,
  type CreatePhotoShareLinkInputSchema,
  createFolderShareLinkInputSchema,
  createPhotoShareLinkInputSchema,
  createShareLinkOutputSchema,
} from './share-link.schema.js';
import type { AuthContext } from '../trpc/context.js';
import { mapToTRPCError } from '../trpc/map-to-trpc.js';
import { AuthMiddleware } from '../auth/middleware.js';

@Router({ alias: 'share' })
export class ShareLinkRouter {
  constructor(private readonly shareLinkService: ShareLinkService) {}

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
}
