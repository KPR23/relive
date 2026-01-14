import { Module } from '@nestjs/common';
import { AuthMiddleware } from 'src/middleware';
import { PhotoService } from './photo.service';
import { PhotoRouter } from './photo.router';
import { B2Storage } from 'src/storage/b2.storage';
import { FolderModule } from 'src/folder/folder.module';

@Module({
  imports: [FolderModule],
  providers: [PhotoService, PhotoRouter, AuthMiddleware, B2Storage],
})
export class PhotoModule {}
