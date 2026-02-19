import { Module } from '@nestjs/common';
import { ShareLinkService } from './share-link.service.js';
import { PhotoPermissionService } from '../photo/photo-permission.service.js';
import { FolderPermissionService } from '../folder/folder-permission.service.js';

@Module({
  providers: [
    ShareLinkService,
    PhotoPermissionService,
    FolderPermissionService,
  ],
  exports: [ShareLinkService],
})
export class ShareLinkModule {}
