import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000');
  const origins = corsOrigin.split(',').map(o => o.trim());
  
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.setGlobalPrefix('api');

  const port = configService.get<number>('PORT') || configService.get<number>('BACKEND_PORT', 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`Jurix Backend running on port ${port}`);
}

bootstrap();
