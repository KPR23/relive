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
import type { AuthContext } from 'src/trpc/context';
import z from 'zod';
import {
  listPhotosSchema,
  type ListPhotosSchema,
  type RequestUploadSchema,
  requestUploadSchema,
} from './photo.schema';
import { PhotoService } from './photo.service';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'photo' })
export class PhotoRouter {
  constructor(
    private readonly storage: B2Storage,
    private readonly photoService: PhotoService,
  ) {}

  @Query({
    input: listPhotosSchema,
    output: z.array(
      z.object({
        photoId: z.string(),
        originalName: z.string(),
        createdAt: z.date(),
        takenAt: z.date().nullable(),
        width: z.number().nullable(),
        height: z.number().nullable(),
      }),
    ),
  })
  async listPhotos(@Ctx() ctx: AuthContext, @Input() data: ListPhotosSchema) {
    return this.photoService.listPhotos(ctx.user.id, data.folderId);
  }

  @Query({
    input: z.object({ photoId: z.string().uuid() }),
    output: z.object({
      signedUrl: z.string(),
      expiresAt: z.date(),
    }),
  })
  async getPhotoUrl(
    @Ctx() ctx: AuthContext,
    @Input() data: { photoId: string },
  ) {
    return this.photoService.getPhotoUrl(ctx.user.id, data.photoId);
  }

  @Mutation({
    input: requestUploadSchema,
    output: z.object({
      uploadUrl: z.string(),
      photoId: z.string(),
    }),
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
    input: z.object({ id: z.string() }),
    output: z.object({
      status: z.string(),
    }),
  })
  async confirmUpload(@Ctx() ctx: AuthContext, @Input() data: { id: string }) {
    return this.photoService.confirmUpload({
      id: data.id,
      ownerId: ctx.user.id,
    });
  }
}
