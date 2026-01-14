import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { photo, PhotoStatusEnum } from 'src/db/schema';
import { FolderService } from 'src/folder/folder.service';
import { B2Storage } from 'src/storage/b2.storage';
import { ConfirmUploadPhoto, CreatePendingPhoto } from './photo.schema';

@Injectable()
export class PhotoService {
  constructor(
    private readonly storage: B2Storage,
    private readonly folderService: FolderService,
  ) {}

  async createPending(data: CreatePendingPhoto) {
    return db.transaction(async (tx) => {
      await this.folderService.getOwnedFolderOrThrow(
        data.ownerId,
        data.folderId,
        tx,
      );

      await tx.insert(photo).values({
        id: data.id,
        ownerId: data.ownerId,
        folderId: data.folderId,
        filePath: data.filePath,
        originalName: data.originalName,
        mimeType: data.mimeType,
        status: PhotoStatusEnum.PENDING,
      });
    });
  }

  async confirmUpload(data: ConfirmUploadPhoto) {
    return db.transaction(async (tx) => {
      const [photoRecord] = await tx
        .select()
        .from(photo)
        .where(and(eq(photo.id, data.id), eq(photo.ownerId, data.ownerId)))
        .limit(1);

      if (!photoRecord) {
        throw new NotFoundException('Photo not found');
      }

      if (photoRecord.status !== PhotoStatusEnum.PENDING) {
        throw new ConflictException('Photo not pending');
      }

      try {
        const { size, thumbPath } = await this.storage.getFileInfo(
          photoRecord.filePath,
        );
        await tx
          .update(photo)
          .set({
            status: PhotoStatusEnum.READY,
            size: size.toString(),
            thumbPath,
          })
          .where(and(eq(photo.id, data.id), eq(photo.ownerId, data.ownerId)));

        return {
          status: PhotoStatusEnum.READY,
        };
      } catch {
        await tx
          .update(photo)
          .set({ status: PhotoStatusEnum.FAILED })
          .where(and(eq(photo.id, data.id), eq(photo.ownerId, data.ownerId)));

        return {
          status: PhotoStatusEnum.FAILED,
        };
      }
    });
  }
}
