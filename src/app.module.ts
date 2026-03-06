import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import { PlantsModule } from './plants/plants.module';
import { PerenualModule } from './plant-id/plant-id.module';
import { DiseasesController } from './plants/plants.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PlantsModule,
    PerenualModule,
  ],
  controllers: [AppController, HealthController, DiseasesController],
  providers: [AppService],
})
export class AppModule {}
