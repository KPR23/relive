import { Module } from '@nestjs/common';
import { AuthMiddlewareModule } from '../auth/auth.module.js';
import { FolderModule } from '../folder/folder.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { UserModule } from '../user/user.module.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import { PhotoShareService } from './photo-share.service.js';
import { PhotoUploadService } from './photo-upload.service.js';
import { PhotoRouter } from './photo.router.js';
import { PhotoService } from './photo.service.js';

@Module({
  imports: [AuthMiddlewareModule, FolderModule, StorageModule, UserModule],
  providers: [
    PhotoService,
    PhotoRouter,
    PhotoUploadService,
    PhotoShareService,
    PhotoPermissionService,
  ],

  exports: [PhotoService, PhotoUploadService, PhotoPermissionService],
})
export class PhotoModule {}
