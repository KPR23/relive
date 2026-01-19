import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './env.server.js';

import { handler } from './serverless.js';
export { handler };
export default handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });
  await app.listen(env.PORT);
}

if (!env.VERCEL) {
  void bootstrap();
}
