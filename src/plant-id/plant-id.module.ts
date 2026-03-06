import { Module } from '@nestjs/common';
import { PlantIdController } from './plant-id.controller';
import { PlantIdService } from './plant-id.service';

@Module({
  controllers: [PlantIdController],
  providers: [PlantIdService],
  exports: [PlantIdService],
})
export class PerenualModule {}
