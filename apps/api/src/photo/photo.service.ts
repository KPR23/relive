import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { photo, PhotoStatusEnum } from '../db/schema.js';
import { FolderService } from '../folder/folder.service.js';
import { B2Storage } from '../storage/b2.storage.js';
import { ConfirmUploadPhoto, CreatePendingPhoto } from './photo.schema.js';
import { generateAndUploadThumbnail } from './thumbnail.js';
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
        console.error(
          `Failed to confirm upload for photo ${photoRecord.id}`,
          err,
        );

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

  async listAllPhotos(userId: string) {
    const photos = await db
      .select()
      .from(photo)
      .where(
        and(eq(photo.ownerId, userId), eq(photo.status, PhotoStatusEnum.READY)),
      )
      .orderBy(desc(photo.createdAt));

    return this.mapPhotosToResponse(photos);
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

    return this.mapPhotosToResponse(photos);
  }

  async getThumbnailUrl(userId: string, photoId: string) {
    const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId);

    if (!photoRecord.thumbPath) {
      throw new NotFoundException('Thumbnail not found');
    }

    const { signedUrl, expiresAt } = await this.storage.getSignedUrl(
      photoRecord.thumbPath,
      60 * 60 * 24 * 6,
    );

    return {
      signedUrl,
      expiresAt,
    };
  }

  async getPhotoUrl(userId: string, photoId: string) {
    const photoRecord = await this.getReadyPhotoOrThrow(userId, photoId);
    return this.storage.getSignedUrl(photoRecord.filePath, 60 * 60);
  }

  private async getReadyPhotoOrThrow(userId: string, photoId: string) {
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

    return photoRecord;
  }

  private async mapPhotosToResponse(photos: (typeof photo.$inferSelect)[]) {
    const photosWithThumbnails = await Promise.all(
      photos.map(async (photo) => {
        if (!photo.thumbPath) {
          throw new ConflictException(
            `READY photo ${photo.id} is missing thumbPath`,
          );
        }

        const { signedUrl } = await this.storage.getSignedUrl(
          photo.thumbPath,
          60 * 60 * 24 * 6,
        );

        return {
          photoId: photo.id,
          originalName: photo.originalName,
          createdAt: photo.createdAt,
          takenAt: photo.takenAt,
          width: photo.width,
          height: photo.height,
          thumbnailUrl: signedUrl,
        };
      }),
    );

    return photosWithThumbnails;
  }
}
