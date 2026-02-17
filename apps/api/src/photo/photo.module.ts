import { Module } from '@nestjs/common';
import { FolderModule } from '../folder/folder.module.js';
import { PhotoService } from './photo.service.js';
import { PhotoRouter } from './photo.router.js';
import { AuthMiddleware } from '../middleware.js';
import { B2Storage } from '../storage/b2.storage.js';
import { PhotoUploadService } from './photo-upload.service.js';
import { PhotoShareService } from './photo-share.service.js';
import { PhotoPermissionService } from './photo-permission.service.js';

@Module({
  imports: [FolderModule],
  providers: [
    PhotoService,
    PhotoRouter,
    PhotoUploadService,
    PhotoShareService,
    PhotoPermissionService,
    AuthMiddleware,
    B2Storage,
  ],

  exports: [PhotoService, PhotoUploadService, PhotoPermissionService],
})
export class PhotoModule {}
