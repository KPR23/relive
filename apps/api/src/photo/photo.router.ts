import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from 'src/middleware';
import { B2Storage } from 'src/storage/b2.storage';
import type { AuthContext } from 'src/trpc/context';
import { PhotoService } from './photo.service';
import z from 'zod';
import { type RequestUploadSchema, requestUploadSchema } from './photo.schema';

@UseMiddlewares(AuthMiddleware)
@Router({ alias: 'photo' })
export class PhotoRouter {
  constructor(
    private readonly storage: B2Storage,
    private readonly photoService: PhotoService,
  ) {}

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
}
