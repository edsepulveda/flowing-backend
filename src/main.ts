import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppLogger } from './core/logger/logger.service';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const environment = configService.get<string>('NODE_ENV', 'development');

  const logger = app.get(AppLogger);
  logger.setContext('Bootstrap');
  app.useLogger(logger);
  app.use(cookieParser());

  app.enableCors({
    origin: '*',
  });
  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Enterprise API')
    .setDescription('Enterprise-grade NestJS API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  logger.log('Swagger documentation is available at /api/docs');

  await app.listen(port);
  logger.log(`Application is running on port ${port} in ${environment} mode`);
}

bootstrap().catch((err) => {
  console.error('Error starting application:', err);
  process.exit(1);
});
