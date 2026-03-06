import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:4200'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (como Postman, curl, cronjobs)
      if (!origin) return callback(null, true);
      
      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // Prefijo global para las rutas
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  const environment = process.env.NODE_ENV || 'development';
  console.log(`🌱 PlantApp Backend ejecutándose en http://localhost:${port}/api`);
  console.log(`🌍 CORS habilitado para: ${allowedOrigins.join(', ')}`);
  console.log(`📦 Entorno: ${environment}`);
}
bootstrap();
