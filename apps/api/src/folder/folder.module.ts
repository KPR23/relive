import { Module } from '@nestjs/common';
import { FolderService } from './folder.service.js';
import { FolderRouter } from './folder.router.js';
import { B2Storage } from '../storage/b2.storage.js';
import { AuthMiddleware } from '../middleware.js';

@Module({
  providers: [FolderService, FolderRouter, B2Storage, AuthMiddleware],
  exports: [FolderService],
})
export class FolderModule {}
