import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlantsController } from './plants.controller';
import { PlantsService } from './plants.service';
import { PerenualService } from './perenual.service';
import { PexelsService } from './pexels.service';

@Module({
  imports: [HttpModule],
  controllers: [PlantsController],
  providers: [PlantsService, PerenualService, PexelsService],
  exports: [PlantsService, PerenualService, PexelsService],
})
export class PlantsModule {}
