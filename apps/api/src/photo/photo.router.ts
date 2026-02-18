import { TRPCError } from '@trpc/server';
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
import { StorageService } from '../storage/storage.service.js';
import type { AuthContext } from '../trpc/context.js';
import { mapToTRPCError } from '../trpc/map-to-trpc.js';
import { PhotoShareService } from './photo-share.service.js';
import { PhotoUploadService } from './photo-upload.service.js';
import {
  confirmUploadOutputSchema,
  listPhotosSchema,
  type ListPhotosSchema,
  type MovePhotoToFolderInputSchema,
  movePhotoToFolderInputSchema,
  photoIdInputSchema,
  type PhotoIdInputSchema,
  photoListSchema,
  photoShareListItemSchema,
  requestUploadOutputSchema,
  requestUploadSchema,
  type RequestUploadSchema,
  revokePhotoShareInputSchema,
  type RevokePhotoShareInputSchema,
  sharedPhotosWithMeOutputSchema,
  type SharePhotoWithUserInputSchema,
  sharePhotoWithUserInputSchema,
  signedUrlOutputSchema,
} from './photo.schema.js';
import { PhotoService } from './photo.service.js';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'photo' })
export class PhotoRouter {
  constructor(
    private readonly storage: StorageService,
    private readonly photoService: PhotoService,
    private readonly photoUploadService: PhotoUploadService,
    private readonly photoShareService: PhotoShareService,
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
    input: photoIdInputSchema,
    output: z.array(photoShareListItemSchema),
  })
  async listPhotoShares(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
  ) {
    try {
      return await this.photoShareService.listPhotoShares(
        _ctx.user.id,
        data.photoId,
      );
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({
    input: photoIdInputSchema,
    output: signedUrlOutputSchema,
  })
  async getThumbnailUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
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
    input: photoIdInputSchema,
    output: signedUrlOutputSchema,
  })
  async getPhotoUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
  ) {
    try {
      return await this.photoService.getPhotoUrl(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({ output: sharedPhotosWithMeOutputSchema })
  async sharedPhotosWithMe(@Ctx() _ctx: AuthContext) {
    try {
      return await this.photoShareService.sharedPhotosWithMe(_ctx.user.id);
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
      return await this.photoShareService.sharePhotoWithUser(
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
    input: movePhotoToFolderInputSchema,
  })
  async movePhotoToFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: MovePhotoToFolderInputSchema,
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
    input: photoIdInputSchema,
  })
  async removePhoto(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
  ) {
    try {
      return await this.photoService.removePhoto(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: photoIdInputSchema,
  })
  async removePhotoFromFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
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
      return await this.photoShareService.revokePhotoShare(
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

      await this.photoUploadService.createPending({
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
    input: photoIdInputSchema,
    output: confirmUploadOutputSchema,
  })
  async confirmUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: PhotoIdInputSchema,
  ) {
    try {
      return await this.photoUploadService.confirmUpload({
        photoId: data.photoId,
        ownerId: _ctx.user.id,
      });
    } catch (err) {
      mapToTRPCError(err);
    }
  }
}
