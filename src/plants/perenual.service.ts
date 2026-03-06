import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PerenualPlant {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name: string[];
  cycle: string;
  watering: string;
  sunlight: string[];
  default_image: {
    regular_url: string;
    medium_url: string;
    small_url: string;
    thumbnail: string;
  };
}

export interface PerenualPlantDetail {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name: string[];
  family: string;
  origin: string[];
  type: string;
  dimension: string;
  cycle: string;
  attracts: string[];
  propagation: string[];
  hardiness: {
    min: string;
    max: string;
  };
  hardiness_location: {
    full_url: string;
    full_iframe: string;
  };
  watering: string;
  depth_water_requirement: {
    unit: string;
    value: string;
  };
  volume_water_requirement: {
    unit: string;
    value: string;
  };
  watering_period: string;
  watering_general_benchmark: {
    value: string;
    unit: string;
  };
  plant_anatomy: any[];
  sunlight: string[];
  pruning_month: string[];
  pruning_count: any;
  seeds: number;
  maintenance: string;
  care_level: string;
  growth_rate: string;
  drought_tolerant: boolean;
  salt_tolerant: boolean;
  thorny: boolean;
  invasive: boolean;
  tropical: boolean;
  indoor: boolean;
  care_guides: string;
  pest_susceptibility: any[];
  pest_susceptibility_api: string;
  flowers: boolean;
  flowering_season: string;
  flower_color: string;
  cones: boolean;
  fruits: boolean;
  edible_fruit: boolean;
  edible_fruit_taste_profile: string;
  fruit_nutritional_value: string;
  fruit_color: string[];
  harvest_season: string;
  leaf: boolean;
  leaf_color: string[];
  edible_leaf: boolean;
  cuisine: boolean;
  medicinal: boolean;
  poisonous_to_humans: number;
  poisonous_to_pets: number;
  description: string;
  default_image: {
    license: number;
    license_name: string;
    license_url: string;
    original_url: string;
    regular_url: string;
    medium_url: string;
    small_url: string;
    thumbnail: string;
  };
}

export interface PerenualResponse {
  data: PerenualPlant[];
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

@Injectable()
export class PerenualService {
  private readonly logger = new Logger(PerenualService.name);
  private readonly baseUrl = 'https://perenual.com/api';
  private readonly apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTTL: number; // milliseconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('PERENUAL_API_KEY') || '';
    const ttlHours = this.configService.get<number>('CACHE_TTL_HOURS') || 24;
    this.cacheTTL = ttlHours * 60 * 60 * 1000;
    
    if (!this.apiKey) {
      this.logger.warn('PERENUAL_API_KEY not configured. External plant data will not be available.');
    } else {
      this.logger.log('🌿 Perenual API service initialized');
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.logger.debug(`📋 Cache hit for key: ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
    this.logger.debug(`💾 Cached data for key: ${key}`);
  }

  async searchPlants(query: string, page: number = 1): Promise<PerenualResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'Perenual API not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = `search-${query}-${page}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      this.logger.log(`🔍 Searching plants: "${query}" (page ${page})`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/species-list`, {
          params: {
            key: this.apiKey,
            q: query,
            page,
          },
        }),
      );

      this.setCachedData(cacheKey, response.data);
      this.logger.log(`✅ Found ${response.data.data.length} plants for "${query}"`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error searching plants: ${error.message}`);
      throw new HttpException(
        'Error fetching plants from Perenual API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPlantsList(page: number = 1, perPage: number = 30): Promise<PerenualResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'Perenual API not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = `list-${page}-${perPage}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      this.logger.log(`📋 Fetching plants list (page ${page}, per_page ${perPage})`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/species-list`, {
          params: {
            key: this.apiKey,
            page,
            per_page: perPage,
          },
        }),
      );

      this.setCachedData(cacheKey, response.data);
      this.logger.log(`✅ Fetched ${response.data.data.length} plants`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error fetching plants list: ${error.message}`);
      throw new HttpException(
        'Error fetching plants from Perenual API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPlantDetails(plantId: number): Promise<PerenualPlantDetail> {
    if (!this.apiKey) {
      throw new HttpException(
        'Perenual API not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = `details-${plantId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      this.logger.log(`🔍 Fetching plant details for ID: ${plantId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/species/details/${plantId}`, {
          params: {
            key: this.apiKey,
          },
        }),
      );

      this.setCachedData(cacheKey, response.data);
      this.logger.log(`✅ Fetched details for plant: ${response.data.common_name}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error fetching plant details: ${error.message}`);
      throw new HttpException(
        'Error fetching plant details from Perenual API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getCareGuide(plantId: number): Promise<any> {
    if (!this.apiKey) {
      throw new HttpException(
        'Perenual API not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = `care-${plantId}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      this.logger.log(`📖 Fetching care guide for plant ID: ${plantId}`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/species-care-guide-list`, {
          params: {
            key: this.apiKey,
            species_id: plantId,
          },
        }),
      );

      this.setCachedData(cacheKey, response.data);
      this.logger.log(`✅ Fetched care guide for plant ID: ${plantId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error fetching care guide: ${error.message}`);
      throw new HttpException(
        'Error fetching care guide from Perenual API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  clearCache(): void {
    this.cache.clear();
    this.logger.log('🗑️ Cache cleared');
  }

  getCacheStats(): { size: number; ttlHours: number } {
    return {
      size: this.cache.size,
      ttlHours: this.cacheTTL / (60 * 60 * 1000),
    };
  }
}
