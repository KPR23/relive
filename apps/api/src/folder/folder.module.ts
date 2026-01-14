import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderRouter } from './folder.router';
import { B2Storage } from 'src/storage/b2.storage';
import { AuthMiddleware } from 'src/middleware';

@Module({
  providers: [FolderService, FolderRouter, B2Storage, AuthMiddleware],
  exports: [FolderService],
})
export class FolderModule {}
