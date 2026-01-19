import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { env } from './env.server.js';

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

void bootstrap();
