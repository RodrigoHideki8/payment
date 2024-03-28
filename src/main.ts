import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  INestApplication,
  Logger,
  LogLevel,
  ValidationPipe,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { GenericErrorFilter } from './infrastructure/error/generic-error-filter.error';

dotenv.config();

function boostrapSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Payment API')
    .setDescription('The Payment API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
}

(async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: process.env.LOG_LEVELS?.split(',') as LogLevel[],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors();
  app.setGlobalPrefix(process.env.API_PREFIX || 'api');
  app.enableShutdownHooks();
  app.useGlobalFilters(new GenericErrorFilter());
  boostrapSwagger(app);
  await app.listen(process.env.PORT || 3000);

  logger.log(`Server running in PORT ${process.env.PORT || 3000}`);
  logger.log(`Server running with PREFIX /${process.env.API_PREFIX || 'api'}`);
})();
