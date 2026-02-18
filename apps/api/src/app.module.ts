import {
  ArcjetGuard,
  ArcjetModule,
  ArcjetWellKnownBot,
  detectBot,
  shield,
  slidingWindow,
} from '@arcjet/nest';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { auth } from './auth.js';
import { CleanupController } from './cleanup/cleanup.controller.js';
import { env } from './env.server.js';
import { FolderModule } from './folder/folder.module.js';
import { PhotoModule } from './photo/photo.module.js';
import { TrpcModule } from './trpc/trpc.module.js';
import { UserService } from './user/user.service.js';
import { AuthMiddleware } from './middleware.js';
import { UserModule } from './user/user.module.js';

const isProduction = env.NODE_ENV === 'production';
const devBots: ArcjetWellKnownBot[] = isProduction ? [] : ['CURL'];
@Module({
  imports: [
    ArcjetModule.forRoot({
      isGlobal: true,
      key: env.ARCJET_KEY,
      rules: [
        shield({ mode: isProduction ? 'LIVE' : 'DRY_RUN' }),

        detectBot({
          mode: isProduction ? 'LIVE' : 'DRY_RUN',
          allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:MONITOR', ...devBots],
        }),

        slidingWindow({
          mode: isProduction ? 'LIVE' : 'DRY_RUN',
          interval: '60s',
          max: isProduction ? 300 : 1000,
        }),
      ],
    }),
    TrpcModule,
    AuthModule.forRoot({ auth }),
    PhotoModule,
    FolderModule,
    UserModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
    AppService,
    UserService,
    AuthMiddleware,
  ],
  controllers: [AppController, CleanupController],
})
export class AppModule {}
