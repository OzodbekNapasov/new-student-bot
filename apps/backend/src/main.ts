import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger OpenAPI Setup
  const config = new DocumentBuilder()
    .setTitle('Student Management Platform API')
    .setDescription('Enterprise NestJS API for Telegram WebApp, Telegram Bot & Admin Panel')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & JWT Token Rotation')
    .addTag('Groups', 'Academic Group Management')
    .addTag('Students', 'Student Registry & Profile Scoping')
    .addTag('Attendance', '1-Click Daily Attendance Tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 NestJS Backend API running on http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger OpenAPI Documentation available on http://localhost:${port}/api/v1/docs`);
}

bootstrap();
