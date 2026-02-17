import { TRPCError } from '@trpc/server';
import { UUID } from 'crypto';
import {
  Ctx,
  Input,
  Mutation,
  Query,
  Router,
  UseMiddlewares,
} from 'nestjs-trpc';
import z from 'zod';
import { AuthMiddleware } from '../middleware.js';
import { B2Storage } from '../storage/b2.storage.js';
import type { AuthContext } from '../trpc/context.js';
import { mapToTRPCError } from '../trpc/map-to-trpc.js';
import {
  confirmUploadOutputSchema,
  listPhotosSchema,
  type ListPhotosSchema,
  photoListSchema,
  photoShareListItemSchema,
  requestUploadOutputSchema,
  requestUploadSchema,
  type RequestUploadSchema,
  revokePhotoShareInputSchema,
  type RevokePhotoShareInputSchema,
  type SharePhotoWithUserInputSchema,
  sharePhotoWithUserInputSchema,
  signedUrlOutputSchema,
} from './photo.schema.js';
import { PhotoService } from './photo.service.js';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'photo' })
export class PhotoRouter {
  constructor(
    private readonly storage: B2Storage,
    private readonly photoService: PhotoService,
  ) {}

  @Query({
    input: listPhotosSchema,
    output: photoListSchema,
  })
  async listPhotosForFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: ListPhotosSchema,
  ) {
    try {
      return await this.photoService.listPhotos(_ctx.user.id, data.folderId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    output: photoListSchema,
  })
  async listAllPhotos(@Ctx() _ctx: AuthContext) {
    try {
      return await this.photoService.listAllPhotos(_ctx.user.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: z.object({ photoId: z.uuid() }),
    output: z.array(photoShareListItemSchema),
  })
  async listPhotoShares(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.listPhotoShares(
        _ctx.user.id,
        data.photoId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: z.object({ photoId: z.uuid() }),
    output: signedUrlOutputSchema,
  })
  async getThumbnailUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.getThumbnailUrl(
        _ctx.user.id,
        data.photoId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: z.object({ photoId: z.uuid() }),
    output: signedUrlOutputSchema,
  })
  async getPhotoUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.getPhotoUrl(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({ output: photoListSchema })
  async sharedPhotosWithMe(@Ctx() _ctx: AuthContext) {
    try {
      return await this.photoService.sharedPhotosWithMe(_ctx.user.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: sharePhotoWithUserInputSchema,
  })
  async sharePhotoWithUser(
    @Ctx() _ctx: AuthContext,
    @Input() data: SharePhotoWithUserInputSchema,
  ) {
    try {
      return await this.photoService.sharePhotoWithUser(
        _ctx.user.id,
        data.photoId,
        data.targetUserEmail,
        data.permission,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.uuid(), folderId: z.uuid() }),
  })
  async movePhotoToFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID; folderId: UUID },
  ) {
    try {
      return await this.photoService.movePhotoToFolder(
        _ctx.user.id,
        data.photoId,
        data.folderId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.uuid() }),
  })
  async removePhoto(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.removePhoto(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.uuid() }),
  })
  async removePhotoFromFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.removePhotoFromFolder(
        _ctx.user.id,
        data.photoId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: revokePhotoShareInputSchema,
  })
  async revokePhotoShare(
    @Ctx() _ctx: AuthContext,
    @Input() data: RevokePhotoShareInputSchema,
  ) {
    try {
      return await this.photoService.revokePhotoShare(
        _ctx.user.id,
        data.photoId,
        data.targetUserId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: requestUploadSchema,
    output: requestUploadOutputSchema,
  })
  async requestUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: RequestUploadSchema,
  ) {
    const parts = data.mimeType.split('/');
    if (parts.length !== 2 || !parts[1]) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Invalid mimeType format',
      });
    }
    const ext = parts[1];
    const photoId = crypto.randomUUID();
    const key = `photos/${_ctx.user.id}/${photoId}.${ext}`;

    try {
      const uploadUrl = await this.storage.getUploadUrl(key, data.mimeType);

      await this.photoService.createPending({
        id: photoId,
        ownerId: _ctx.user.id,
        folderId: data.folderId,
        filePath: key,
        originalName: data.originalName,
        mimeType: data.mimeType,
      });

      return {
        uploadUrl,
        photoId,
      };
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.uuid() }),
    output: confirmUploadOutputSchema,
  })
  async confirmUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: UUID },
  ) {
    try {
      return await this.photoService.confirmUpload({
        photoId: data.photoId,
        ownerId: _ctx.user.id,
      });
    } catch (err) {
      mapToTRPCError(err);
    }
  }
}
