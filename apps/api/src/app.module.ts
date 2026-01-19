import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  slidingWindow,
  shield,
} from '@arcjet/nest';
import { TrpcModule } from './trpc/trpc.module.js';
import { auth } from './auth.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { env } from './env.server.js';
import { PhotoModule } from './photo/photo.module.js';
import { FolderModule } from './folder/folder.module.js';
import { AppService } from './app.service.js';
import { AppController } from './app.controller.js';

const isProduction = env.NODE_ENV === 'production';

@Module({
  imports: [
    ArcjetModule.forRoot({
      isGlobal: true,
      key: env.ARCJET_KEY,
      rules: [
        shield({ mode: 'LIVE' }),

        detectBot({
          mode: 'LIVE',
          allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:MONITOR'],
        }),

        slidingWindow({
          mode: 'LIVE',
          interval: '60s',
          max: isProduction ? 300 : 1000,
        }),
      ],
    }),
    TrpcModule,
    AuthModule.forRoot({ auth }),
    PhotoModule,
    FolderModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
    AppService,
  ],
  controllers: [AppController],
})
export class AppModule {}
