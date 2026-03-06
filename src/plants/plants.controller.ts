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
  async getPlantById(@Param('id') id: string) {
    // Si el ID tiene formato "external-123", es una planta de la API externa
    if (id.startsWith('external-')) {
      const externalId = parseInt(id.replace('external-', ''));
      console.log(`🌍 Fetching external plant with ID: ${externalId}`);
      
      const externalPlant = await this.perenualService.getPlantDetails(externalId);
      
      // Transformar al formato que espera el frontend
      return {
        id: `external-${externalId}`,
        name: externalPlant.common_name || 'Unknown Plant',
        scientificName: Array.isArray(externalPlant.scientific_name) 
          ? externalPlant.scientific_name.join(', ') 
          : externalPlant.scientific_name || 'N/A',
        description: externalPlant.description || 'No description available.',
        imageUrl: externalPlant.default_image?.regular_url || 
                  externalPlant.default_image?.medium_url || 
                  'https://via.placeholder.com/400x400?text=No+Image',
        category: externalPlant.indoor ? 'Interior' : 'Exterior',
        careLevel: this.mapCareLevel(externalPlant.care_level),
        wateringFrequency: this.mapWatering(externalPlant.watering),
        sunlightRequirement: Array.isArray(externalPlant.sunlight) 
          ? externalPlant.sunlight.join(', ') 
          : externalPlant.sunlight || 'Unknown',
        temperature: externalPlant.hardiness 
          ? `${externalPlant.hardiness.min}°C - ${externalPlant.hardiness.max}°C` 
          : 'N/A',
        commonDiseases: [],
      };
    }
    // Si es un número simple, es una planta local
    return this.plantsService.findPlantById(id);
  }

  private mapCareLevel(level: string): 'easy' | 'medium' | 'hard' {
    if (!level) return 'medium';
    const lowerLevel = level.toLowerCase();
    if (lowerLevel.includes('easy') || lowerLevel.includes('low')) return 'easy';
    if (lowerLevel.includes('hard') || lowerLevel.includes('high')) return 'hard';
    return 'medium';
  }

  private mapWatering(watering: string): string {
    if (!watering) return 'Regular';
    const lowerWatering = watering.toLowerCase();
    if (lowerWatering.includes('frequent')) return 'Cada 2-3 días';
    if (lowerWatering.includes('average') || lowerWatering.includes('moderate')) return 'Cada 7-10 días';
    if (lowerWatering.includes('minimum') || lowerWatering.includes('rare')) return 'Cada 2-3 semanas';
    return watering;
  }

  @Get(':id/diseases')
  async getPlantDiseases(@Param('id') id: string) {
    // Si es una planta externa, no hay enfermedades configuradas aún
    if (id.startsWith('external-')) {
      return [];
    }
    // Para plantas locales, devolver enfermedades
    return this.plantsService.findDiseasesByPlantId(id);
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
