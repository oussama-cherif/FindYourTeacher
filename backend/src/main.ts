import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security headers — X-Frame-Options, CSP, HSTS, etc.
  app.use(helmet());

  // Parse httpOnly cookies for refresh token extraction
  app.use(cookieParser());

  // CORS restricted to frontend origin only, with credentials for cookies
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL'),
    credentials: true,
  });

  // Global validation: whitelist strips unknown fields, forbidNonWhitelisted rejects them
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // All routes under /api/...
  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
