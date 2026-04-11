import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const port = Number(process.env.PORT) || 5000;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const corsOrigins = frontendUrl.split(',').map((origin) => origin.trim());

  // Enable HTTP request logging
  app.use((req, res, next) => {
    const logger = new Logger('HTTP');
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - start;
      logger.log(`${method} ${originalUrl} - ${res.statusCode} (${elapsed}ms)`);
    });

    next();
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: corsOrigins,
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

  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}
bootstrap();
