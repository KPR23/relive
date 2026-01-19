import { NestFactory } from '@nestjs/core';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda';
import { AppModule } from './app.module.js';
import { env } from './env.server.js';

type ServerlessExpressHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
) => Promise<APIGatewayProxyResult>;

type ServerlessExpressConfig = {
  app: unknown;
};

type ServerlessExpressFn = (
  config: ServerlessExpressConfig,
) => ServerlessExpressHandler;

async function getServerlessExpress(): Promise<ServerlessExpressFn> {
  const module = await import('@codegenie/serverless-express');
  const fn =
    'default' in module
      ? (module.default as unknown as ServerlessExpressFn)
      : (module as unknown as ServerlessExpressFn);
  return fn;
}

let cachedHandler: ServerlessExpressHandler | undefined;

async function bootstrap(): Promise<ServerlessExpressHandler> {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance() as unknown;
  const serverlessExpress = await getServerlessExpress();
  return serverlessExpress({ app: expressApp });
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  if (!cachedHandler) {
    cachedHandler = await bootstrap();
  }
  return cachedHandler(event, context);
};
