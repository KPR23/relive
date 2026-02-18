import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import type { Request } from 'express';
import { env } from '../env.server.js';
import { PhotoUploadService } from '../photo/photo-upload.service.js';

@Controller('api/cleanup')
export class CleanupController {
  constructor(private readonly photoUploadService: PhotoUploadService) {}

  @AllowAnonymous()
  @Get()
  async cleanupFailedAndPendingPhotos(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : undefined;
    if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
      throw new UnauthorizedException('Invalid or missing cron secret');
    }
    await this.photoUploadService.cleanupFailedAndPendingPhotos();
    return { ok: true };
  }
}
