import { Ctx, Input, Mutation, Router, UseMiddlewares } from 'nestjs-trpc';
import { AuthMiddleware } from 'src/middleware';
import { B2Storage } from 'src/storage/b2.storage';
import type { AuthContext } from 'src/trpc/context';
import { PhotoService } from './photo.service';
import z from 'zod';
import { requestUploadSchema } from './photo.schema';

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
  async requestUpload(@Ctx() _ctx: AuthContext, @Input() input) {
    const photoId = crypto.randomUUID();
    const ext = input.mimeType.split('/')[1];

    const key = `photos/${_ctx.user.id}/${photoId}.${ext}`;

    const uploadUrl = await this.storage.getUploadUrl(key, input.mimeType);

    await this.photoService.createPending({
      id: photoId,
      ownerId: _ctx.user.id,
      folderId: input.folderId,
      filePath: key,
      thumbPath: '',
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: '0',
      status: 'pending',
    });

    return {
      uploadUrl,
      photoId,
    };
  }
}
