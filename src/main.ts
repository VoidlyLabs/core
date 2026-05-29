import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const storagePath = process.env.LOCAL_STORAGE_PATH ?? 'storage/uploads';
  const storagePublicPath = process.env.LOCAL_STORAGE_PUBLIC_PATH ?? '/uploads';

  app.useStaticAssets(storagePath, {
    prefix: storagePublicPath.endsWith('/')
      ? storagePublicPath
      : `${storagePublicPath}/`,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: true,
    credentials: true,
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
  });

  const config = new DocumentBuilder()
    .setTitle('Voidly Core')
    // .setDescription('')
    .setVersion('0.0.1')
    .setContact('Ren', 'https://renrelio.dev', 'renrelio.work@gmail.com')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, {
      deepScanRoutes: true,
    });

  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
