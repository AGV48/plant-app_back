import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Prefijo global para las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🌱 PlantApp Backend ejecutándose en http://localhost:${port}/api`);
}
bootstrap();
