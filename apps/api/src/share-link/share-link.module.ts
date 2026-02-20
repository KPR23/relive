import { Module } from '@nestjs/common';
import { ShareLinkRouter } from './share-link.router.js';
import { ShareLinkService } from './share-link.service.js';
import { PhotoModule } from '../photo/photo.module.js';
import { FolderModule } from '../folder/folder.module.js';

@Module({
  imports: [PhotoModule, FolderModule],
  providers: [ShareLinkService, ShareLinkRouter],
  exports: [ShareLinkService],
})
export class ShareLinkModule {}
