import { Module } from '@nestjs/common';
import { FolderModule } from '../folder/folder.module.js';
import { UserModule } from '../user/user.module.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import { PhotoShareService } from './photo-share.service.js';
import { PhotoUploadService } from './photo-upload.service.js';
import { PhotoRouter } from './photo.router.js';
import { PhotoService } from './photo.service.js';
import { StorageService } from '../storage/storage.service.js';

@Module({
  imports: [FolderModule, UserModule],
  providers: [
    PhotoService,
    PhotoRouter,
    PhotoUploadService,
    PhotoShareService,
    PhotoPermissionService,
    StorageService,
  ],

  exports: [PhotoService, PhotoUploadService, PhotoPermissionService],
})
export class PhotoModule {}
