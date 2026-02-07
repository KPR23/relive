import { Module } from '@nestjs/common';
import { FolderModule } from '../folder/folder.module.js';
import { PhotoService } from './photo.service.js';
import { PhotoRouter } from './photo.router.js';
import { AuthMiddleware } from '../middleware.js';
import { B2Storage } from '../storage/b2.storage.js';

@Module({
  imports: [FolderModule],
  providers: [PhotoService, PhotoRouter, AuthMiddleware, B2Storage],

  exports: [PhotoService],
})
export class PhotoModule {}
