import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { photo, PhotoStatusEnum } from 'src/db/schema';
import { FolderService } from 'src/folder/folder.service';
import { B2Storage } from 'src/storage/b2.storage';
import { ConfirmUploadPhoto, CreatePendingPhoto } from './photo.schema';
import { generateAndUploadThumbnail } from './thumbnail';
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
        .where(and(eq(photo.id, data.photoId), eq(photo.ownerId, data.ownerId)))
        .limit(1);

      if (!photoRecord) {
        throw new NotFoundException('Photo not found');
      }

      if (photoRecord.status !== PhotoStatusEnum.PENDING) {
        throw new ConflictException('Photo not pending');
      }

      const thumbPath = `photos/${photoRecord.ownerId}/${photoRecord.id}_thumb.jpg`;

      try {
        const { size } = await this.storage.getFileInfo(photoRecord.filePath);

        const { width, height } = await generateAndUploadThumbnail({
          storage: this.storage,
          originalKey: photoRecord.filePath,
          thumbKey: thumbPath,
        });

        await tx
          .update(photo)
          .set({
            status: PhotoStatusEnum.READY,
            size,
            thumbPath,
            width,
            height,
          })
          .where(
            and(eq(photo.id, data.photoId), eq(photo.ownerId, data.ownerId)),
          );

        return {
          status: PhotoStatusEnum.READY,
        };
      } catch (err) {
        await tx
          .update(photo)
          .set({
            status: PhotoStatusEnum.FAILED,
          })
          .where(
            and(eq(photo.id, data.photoId), eq(photo.ownerId, data.ownerId)),
          );

        return {
          status: PhotoStatusEnum.FAILED,
        };
      }
    });
  }

  async listPhotos(userId: string, folderId: string) {
    await this.folderService.getOwnedFolderOrThrow(userId, folderId);

    const photos = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.folderId, folderId),
          eq(photo.ownerId, userId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      )
      .orderBy(desc(photo.createdAt));

    return photos.map((photo) => ({
      photoId: photo.id,
      originalName: photo.originalName,
      createdAt: photo.createdAt,
      takenAt: photo.takenAt,
      width: photo.width,
      height: photo.height,
    }));
  }

  async getThumbnailUrl(userId: string, photoId: string) {
    const [photoRecord] = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.ownerId, userId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      )
      .limit(1);

    if (!photoRecord) {
      throw new NotFoundException('Photo not found');
    }

    if (!photoRecord.thumbPath) {
      throw new NotFoundException('Thumbnail not found');
    }

    const { signedUrl, expiresAt } = await this.storage.getSignedUrl(
      photoRecord.thumbPath,
      60 * 60 * 24 * 7,
    );

    return {
      signedUrl,
      expiresAt,
    };
  }

  async getPhotoUrl(userId: string, photoId: string) {
    const [photoRecord] = await db
      .select()
      .from(photo)
      .where(
        and(
          eq(photo.id, photoId),
          eq(photo.ownerId, userId),
          eq(photo.status, PhotoStatusEnum.READY),
        ),
      )
      .limit(1);

    if (!photoRecord) {
      throw new NotFoundException('Photo not found');
    }

    return this.storage.getSignedUrl(photoRecord.filePath);
  }

  // async getThumbnailUrl(photoId: string) {}
}
