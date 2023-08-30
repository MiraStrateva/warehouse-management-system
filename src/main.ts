import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { EntityNotFoundErrorFilter } from './entity-not-found-error.filter';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new EntityNotFoundErrorFilter());
  
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.enableCors();

  await app.listen(3010);
}
bootstrap();
