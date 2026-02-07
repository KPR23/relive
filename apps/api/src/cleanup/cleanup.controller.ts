import { Controller, Get, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { env } from '../env.server.js';
import { PhotoService } from '../photo/photo.service.js';
import { Public } from '@thallesp/nestjs-better-auth';

@Controller('api/cleanup')
export class CleanupController {
  constructor(private readonly photoService: PhotoService) {}

  @Public()
  @Get()
  async cleanupFailedAndPendingPhotos(@Req() req: Request) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : (req.query.secret as string | undefined);
    if (!env.CRON_SECRET || token !== env.CRON_SECRET) {
      throw new UnauthorizedException('Invalid or missing cron secret');
    }
    await this.photoService.cleanupFailedAndPendingPhotos();
    return { ok: true };
  }
}
