import { Controller, Get, Header } from '@nestjs/common';

/**
 * Controller de Health Check y Ping
 * No usa el prefijo /api/ para ser más accesible para cronjobs
 */
@Controller()
export class HealthController {
  /**
   * Endpoint de ping simple para cronjobs
   * Siempre retorna 200 OK con texto plano
   * Uso: curl http://localhost:3000/ping
   * Uso: curl https://tu-dominio.com/ping
   */
  @Get('ping')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'no-cache')
  ping(): string {
    return 'OK';
  }

  /**
   * Endpoint de health check más completo
   * Retorna status de la aplicación en JSON
   * Uso: curl http://localhost:3000/health
   * Uso: curl https://tu-dominio.com/health
   */
  @Get('health')
  @Header('Cache-Control', 'no-cache')
  health(): object {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      service: 'PlantApp Backend',
      version: '1.0.0',
      memory: {
        used: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
    };
  }

  /**
   * Endpoint adicional para verificar conectividad
   * Uso: curl http://localhost:3000/status
   */
  @Get('status')
  @Header('Content-Type', 'text/plain')
  @Header('Cache-Control', 'no-cache')
  status(): string {
    return `ONLINE - ${new Date().toISOString()}`;
  }
}
