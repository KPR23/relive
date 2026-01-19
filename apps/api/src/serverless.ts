import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './env.server.js';
import type { Express } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

let appInstance: Express | undefined;

async function bootstrap(): Promise<Express> {
  if (appInstance) {
    return appInstance;
  }

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await app.init();
  appInstance = app.getHttpAdapter().getInstance() as Express;
  return appInstance;
}

export const handler = async (req: IncomingMessage, res: ServerResponse) => {
  const app = await bootstrap();
  app(req, res);
};

export default handler;
