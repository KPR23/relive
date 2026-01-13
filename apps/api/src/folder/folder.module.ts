import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';

@Module({
  providers: [FolderService]
})
export class FolderModule {}
