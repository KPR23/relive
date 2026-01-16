import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  ArcjetGuard,
  ArcjetModule,
  detectBot,
  fixedWindow,
  shield,
} from '@arcjet/nest';
import { TrpcModule } from './trpc/trpc.module';
import { auth } from './auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { env } from './env.server';
import { PhotoModule } from './photo/photo.module';
import { FolderModule } from './folder/folder.module';

@Module({
  imports: [
    ArcjetModule.forRoot({
      isGlobal: true,
      key: env.ARCJET_KEY,
      rules: [
        shield({ mode: 'LIVE' }),
        detectBot({
          mode: 'LIVE',
          allow: [
            'CATEGORY:SEARCH_ENGINE',
            // 'CATEGORY:MONITOR',
            // 'CATEGORY:PREVIEW',
          ],
        }),
        fixedWindow({
          mode: 'LIVE',
          window: '60s',
          max: 100,
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
  ],
})
export class AppModule {}
