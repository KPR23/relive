import { ForbiddenException, Injectable } from '@nestjs/common';
import { B2Storage } from 'src/storage/b2.storage';
import { CreatePendingPhoto } from './photo.schema';
import { db } from 'src/db';
import { folder, photo } from 'src/db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class PhotoService {
  storage = new B2Storage();

  async createPending(data: CreatePendingPhoto) {
    const [folderRecord] = await db
      .select()
      .from(folder)
      .where(eq(folder.id, data.folderId));

    if (!folderRecord || folderRecord.ownerId !== data.ownerId) {
      throw new ForbiddenException();
    }

    await db.insert(photo).values({
      id: data.id,
      ownerId: data.ownerId,
      folderId: data.folderId,
      filePath: data.filePath,
      originalName: data.originalName,
      mimeType: data.mimeType,
      status: 'PENDING',
    });
  }
}
