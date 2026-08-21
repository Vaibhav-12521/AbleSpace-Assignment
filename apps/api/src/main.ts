import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,

      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const configured = process.env.CORS_ORIGINS?.trim();

  const origins = (configured || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  Logger.log(`API listening on :${port} (CORS: ${origins.join(', ')})`, 'Bootstrap');
}

void bootstrap();
