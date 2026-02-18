import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module.js';
import { FolderPermissionService } from './folder-permission.service.js';
import { FolderShareService } from './folder-share.service.js';
import { FolderRouter } from './folder.router.js';
import { FolderService } from './folder.service.js';

@Module({
  imports: [UserModule],
  providers: [
    FolderService,
    FolderRouter,
    FolderShareService,
    FolderPermissionService,
  ],
  exports: [FolderService, FolderShareService, FolderPermissionService],
})
export class FolderModule {}
