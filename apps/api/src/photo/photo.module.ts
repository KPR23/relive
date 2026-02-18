import { Module } from '@nestjs/common';
import { FolderModule } from '../folder/folder.module.js';
import { UserModule } from '../user/user.module.js';
import { B2Storage } from '../storage/b2.storage.js';
import { PhotoPermissionService } from './photo-permission.service.js';
import { PhotoShareService } from './photo-share.service.js';
import { PhotoUploadService } from './photo-upload.service.js';
import { PhotoRouter } from './photo.router.js';
import { PhotoService } from './photo.service.js';

@Module({
  imports: [FolderModule, UserModule],
  providers: [
    PhotoService,
    PhotoRouter,
    PhotoUploadService,
    PhotoShareService,
    PhotoPermissionService,
    B2Storage,
  ],

  exports: [PhotoService, PhotoUploadService, PhotoPermissionService],
})
export class PhotoModule {}
