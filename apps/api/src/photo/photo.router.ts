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
import { mapToTRPCError } from '../trpc/mapToTRPCError.js';
import {
  confirmUploadOutputSchema,
  listPhotosSchema,
  photoListSchema,
  requestUploadOutputSchema,
  requestUploadSchema,
  signedUrlOutputSchema,
  type ListPhotosSchema,
  type RequestUploadSchema,
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
    input: z.object({ photoId: z.string().uuid() }),
    output: signedUrlOutputSchema,
  })
  async getThumbnailUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
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
    input: z.object({ photoId: z.string().uuid() }),
    output: signedUrlOutputSchema,
  })
  async getPhotoUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    try {
      return await this.photoService.getPhotoUrl(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Query({})
  async sharedPhotosWithMe(@Ctx() _ctx: AuthContext) {
    try {
      return await this.photoService.sharedPhotosWithMe(_ctx.user.id);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.string(), folderId: z.string() }),
  })
  async movePhotoToFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string; folderId: string },
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
    input: z.object({ photoId: z.string() }),
  })
  async removePhoto(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    try {
      return await this.photoService.removePhoto(_ctx.user.id, data.photoId);
    } catch (err) {
      mapToTRPCError(err);
    }
  }

  @Mutation({
    input: z.object({ photoId: z.string() }),
  })
  async removePhotoFromFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
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
    input: requestUploadSchema,
    output: requestUploadOutputSchema,
  })
  async requestUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: RequestUploadSchema,
  ) {
    try {
      const photoId = crypto.randomUUID();
      const ext = data.mimeType.split('/')[1];

      const key = `photos/${_ctx.user.id}/${photoId}.${ext}`;

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
    input: z.object({ photoId: z.string() }),
    output: confirmUploadOutputSchema,
  })
  async confirmUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
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
