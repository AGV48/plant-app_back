import { Controller, Get, Query, Param } from '@nestjs/common';
import { PlantIdService } from './plant-id.service';

@Controller('perenual')
export class PlantIdController {
  constructor(private readonly plantIdService: PlantIdService) {}

  // GET /api/perenual/species?page=1&query=tomato
  @Get('species')
  async getSpeciesList(
    @Query('page') page?: string,
    @Query('query') query?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getSpeciesList(pageNum, query);
  }

  // GET /api/perenual/species/123
  @Get('species/:id')
  async getSpeciesDetails(@Param('id') id: string) {
    return this.plantIdService.getSpeciesDetails(parseInt(id));
  }

  // GET /api/perenual/search?q=monstera
  @Get('search')
  async searchPlants(@Query('q') query: string) {
    if (!query) {
      return { error: 'Query parameter is required' };
    }
    return this.plantIdService.searchPlants(query);
  }

  // GET /api/perenual/care/:speciesId
  @Get('care/:speciesId')
  async getCareGuides(@Param('speciesId') speciesId: string) {
    return this.plantIdService.getCareGuides(parseInt(speciesId));
  }

  // GET /api/perenual/pests?page=1&query=aphid
  @Get('pests')
  async getPestsDiseases(
    @Query('page') page?: string,
    @Query('query') query?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getPestsDiseases(pageNum, query);
  }

  // GET /api/perenual/pests/123
  @Get('pests/:id')
  async getPestDiseaseDetails(@Param('id') id: string) {
    return this.plantIdService.getPestDiseaseDetails(parseInt(id));
  }

  // GET /api/perenual/indoor?page=1
  @Get('indoor')
  async getIndoorPlants(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getPlantsByType(true, pageNum);
  }

  // GET /api/perenual/outdoor?page=1
  @Get('outdoor')
  async getOutdoorPlants(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getPlantsByType(false, pageNum);
  }

  // GET /api/perenual/safe
  @Get('safe')
  async getSafePlants(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getPlantsByToxicity(false, pageNum);
  }

  // GET /api/perenual/toxic
  @Get('toxic')
  async getToxicPlants(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page) : 1;
    return this.plantIdService.getPlantsByToxicity(true, pageNum);
  }
}
