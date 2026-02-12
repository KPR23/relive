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
    return this.photoService.listPhotos(_ctx.user.id, data.folderId);
  }

  @Query({
    output: photoListSchema,
  })
  async listAllPhotos(@Ctx() _ctx: AuthContext) {
    return this.photoService.listAllPhotos(_ctx.user.id);
  }

  @Query({
    input: z.object({ photoId: z.string().uuid() }),
    output: signedUrlOutputSchema,
  })
  async getThumbnailUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.getThumbnailUrl(_ctx.user.id, data.photoId);
  }

  @Query({
    input: z.object({ photoId: z.string().uuid() }),
    output: signedUrlOutputSchema,
  })
  async getPhotoUrl(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.getPhotoUrl(_ctx.user.id, data.photoId);
  }

  @Mutation({
    input: z.object({ photoId: z.string(), folderId: z.string() }),
  })
  async movePhotoToFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string; folderId: string },
  ) {
    return this.photoService.movePhotoToFolder(
      _ctx.user.id,
      data.photoId,
      data.folderId,
    );
  }

  @Mutation({
    input: z.object({ photoId: z.string() }),
  })
  async removePhoto(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.removePhoto(_ctx.user.id, data.photoId);
  }

  @Mutation({
    input: z.object({ photoId: z.string() }),
  })
  async removePhotoFromFolder(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.removePhotoFromFolder(_ctx.user.id, data.photoId);
  }

  @Mutation({
    input: requestUploadSchema,
    output: requestUploadOutputSchema,
  })
  async requestUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: RequestUploadSchema,
  ) {
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
  }

  @Mutation({
    input: z.object({ photoId: z.string() }),
    output: confirmUploadOutputSchema,
  })
  async confirmUpload(
    @Ctx() _ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.confirmUpload({
      photoId: data.photoId,
      ownerId: _ctx.user.id,
    });
  }
}
