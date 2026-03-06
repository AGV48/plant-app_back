import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { PerenualService, PerenualResponse } from './perenual.service';
import { PexelsService } from './pexels.service';
import { CreatePlantDto, UpdatePlantDto } from './dto/plant.dto';
import { CreateDiseaseDto } from './dto/disease.dto';

@Controller('plants')
export class PlantsController {
  constructor(
    private readonly plantsService: PlantsService,
    private readonly perenualService: PerenualService,
    private readonly pexelsService: PexelsService,
  ) {}

  // Endpoints de plantas LOCALES (base de datos en memoria)
  @Get('local')
  getAllLocalPlants(@Query('category') category?: string) {
    if (category) {
      return this.plantsService.findPlantsByCategory(category);
    }
    return this.plantsService.findAllPlants();
  }

  @Get('local/:id')
  getLocalPlantById(@Param('id') id: string) {
    return this.plantsService.findPlantById(id);
  }

  @Get('local/:id/diseases')
  getLocalPlantDiseases(@Param('id') id: string) {
    return this.plantsService.findDiseasesByPlantId(id);
  }

  // Endpoints para API EXTERNA de Perenual (plantas reales)
  @Get('external/search')
  async searchExternalPlants(
    @Query('q') query: string,
    @Query('page') page?: number,
  ): Promise<PerenualResponse> {
    return this.perenualService.searchPlants(query, page || 1);
  }

  @Get('external/list')
  async listExternalPlants(
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ): Promise<PerenualResponse> {
    return this.perenualService.getPlantsList(page || 1, perPage || 30);
  }

  @Get('external/:id')
  async getExternalPlantDetails(@Param('id') id: string) {
    return this.perenualService.getPlantDetails(parseInt(id));
  }

  @Get('external/:id/care')
  async getExternalPlantCare(@Param('id') id: string) {
    return this.perenualService.getCareGuide(parseInt(id));
  }

  // Endpoint unificado que devuelve TANTO locales como externas
  @Get()
  async getAllPlants(
    @Query('category') category?: string,
    @Query('source') source?: 'local' | 'external' | 'all',
  ): Promise<any> {
    const requestedSource = source || 'local';

    if (requestedSource === 'local') {
      if (category) {
        return this.plantsService.findPlantsByCategory(category);
      }
      return this.plantsService.findAllPlants();
    }

    if (requestedSource === 'external') {
      return this.perenualService.getPlantsList(1, 30);
    }

    // Si source === 'all', devuelve ambas fuentes
    const localPlants = this.plantsService.findAllPlants();
    const externalPlants = await this.perenualService.getPlantsList(1, 20);
    
    return {
      local: localPlants,
      external: externalPlants.data,
      total: {
        local: localPlants.length,
        external: externalPlants.total,
      },
    };
  }

  @Get(':id')
  getPlantById(@Param('id') id: string) {
    return this.plantsService.findPlantById(id);
  }

  @Post()
  createPlant(@Body() createPlantDto: CreatePlantDto) {
    return this.plantsService.createPlant(createPlantDto);
  }

  @Put(':id')
  updatePlant(@Param('id') id: string, @Body() updatePlantDto: UpdatePlantDto) {
    return this.plantsService.updatePlant(id, updatePlantDto);
  }

  @Delete(':id')
  deletePlant(@Param('id') id: string) {
    this.plantsService.deletePlant(id);
    return { message: 'Planta eliminada exitosamente' };
  }

  // Nuevo endpoint para limpiar cache
  @Post('cache/clear')
  clearCache() {
    this.perenualService.clearCache();
    this.pexelsService.clearCache();
    return { 
      message: 'Cache cleared successfully',
      perenual: this.perenualService.getCacheStats(),
      pexels: this.pexelsService.getCacheStats(),
    };
  }

  @Get('cache/stats')
  getCacheStats() {
    return {
      perenual: this.perenualService.getCacheStats(),
      pexels: this.pexelsService.getCacheStats(),
    };
  }
}

@Controller('diseases')
export class DiseasesController {
  constructor(private readonly plantsService: PlantsService) {}

  @Get()
  getAllDiseases(@Query('type') type?: string) {
    if (type) {
      return this.plantsService.findDiseasesByType(type);
    }
    return this.plantsService.findAllDiseases();
  }

  @Get(':id')
  getDiseaseById(@Param('id') id: string) {
    return this.plantsService.findDiseaseById(id);
  }

  @Post()
  createDisease(@Body() createDiseaseDto: CreateDiseaseDto) {
    return this.plantsService.createDisease(createDiseaseDto);
  }
}
