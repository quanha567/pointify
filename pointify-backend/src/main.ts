import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Automatically load environment files (.env.development.local, .env.development, .env.local, .env)
const envFiles = ['.env.development.local', '.env.development', '.env.local', '.env'];

for (const file of envFiles) {
  const envPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import fastifyCookie, { type FastifyCookieOptions } from '@fastify/cookie';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || 'pointify-cookie-secret-key',
  } as FastifyCookieOptions);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Setup Swagger OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Pointify API')
    .setDescription('Pointify Scrum Poker Backend API Documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter Firebase ID Token',
      },
      'bearer',
    )
    .addCookieAuth(
      '__session',
      {
        type: 'apiKey',
        in: 'cookie',
        name: '__session',
        description: 'Session cookie containing Firebase ID Token',
      },
      'cookie',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
    yamlDocumentUrl: 'api/docs-yaml',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
await bootstrap();
