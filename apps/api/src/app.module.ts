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
import { TodoModule } from './todo/todo.module';
import { auth } from './auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { TestController } from './test/test.controller';
import { env } from './env';
import { PhotoModule } from './photo/photo.module';
import { PhotoService } from './photo/photo.service';

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
    TodoModule,
    AuthModule.forRoot({ auth }),
    PhotoModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
    PhotoService,
  ],
  controllers: [TestController],
})
export class AppModule {}
