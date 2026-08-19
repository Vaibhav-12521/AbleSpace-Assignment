import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      // Strip properties the DTO doesn't declare instead of persisting them.
      whitelist: true,
      forbidNonWhitelisted: true,
      // Lets @Type()/@Transform() run so query strings arrive as real types.
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
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
