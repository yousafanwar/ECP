import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validation pipes for the implementation of DTOs vaidation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // strips unknown fields
      forbidNonWhitelisted: true,
      transform: true,          // transforms payloads to DTO instances
    }),
  );

  await app.listen(5000);
  console.log(`Server is running port 5000`);
}
bootstrap();
