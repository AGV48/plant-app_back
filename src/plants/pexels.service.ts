import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  total_results: number;
  next_page?: string;
}

@Injectable()
export class PexelsService {
  private readonly logger = new Logger(PexelsService.name);
  private readonly baseUrl = 'https://api.pexels.com/v1';
  private readonly apiKey: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTTL: number; // milliseconds

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('PEXELS_API_KEY') || '';
    const ttlHours = this.configService.get<number>('CACHE_TTL_HOURS') || 24;
    this.cacheTTL = ttlHours * 60 * 60 * 1000;
    
    if (!this.apiKey) {
      this.logger.warn('PEXELS_API_KEY not configured. Disease images will use fallback URLs.');
    } else {
      this.logger.log('📸 Pexels API service initialized');
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

  async searchPhotos(query: string, perPage: number = 15): Promise<PexelsResponse> {
    if (!this.apiKey) {
      throw new HttpException(
        'Pexels API not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    const cacheKey = `photos-${query}-${perPage}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      this.logger.log(`🔍 Searching photos for: "${query}"`);
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/search`, {
          headers: {
            Authorization: this.apiKey,
          },
          params: {
            query,
            per_page: perPage,
            orientation: 'landscape',
          },
        }),
      );

      this.setCachedData(cacheKey, response.data);
      this.logger.log(`✅ Found ${response.data.photos.length} photos for "${query}"`);
      return response.data;
    } catch (error) {
      this.logger.error(`❌ Error searching photos: ${error.message}`);
      throw new HttpException(
        'Error fetching photos from Pexels API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPhotoForDisease(diseaseName: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn(`Pexels API not configured, returning null for: ${diseaseName}`);
      return null;
    }

    try {
      // Create search query optimized for plant diseases
      const searchQuery = `plant disease ${diseaseName}`.toLowerCase();
      this.logger.log(`🔍 Searching image for disease: ${diseaseName}`);
      
      const response = await this.searchPhotos(searchQuery, 5);
      
      if (response.photos && response.photos.length > 0) {
        // Return the medium-sized image URL
        const imageUrl = response.photos[0].src.large;
        this.logger.log(`✅ Found image for ${diseaseName}: ${imageUrl}`);
        return imageUrl;
      }

      this.logger.warn(`⚠️ No images found for disease: ${diseaseName}`);
      return null;
    } catch (error) {
      this.logger.error(`❌ Error getting photo for disease: ${error.message}`);
      return null;
    }
  }

  async getPhotoForPlant(plantName: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.warn(`Pexels API not configured, returning null for: ${plantName}`);
      return null;
    }

    try {
      const searchQuery = `${plantName} plant`.toLowerCase();
      this.logger.log(`🔍 Searching image for plant: ${plantName}`);
      
      const response = await this.searchPhotos(searchQuery, 5);
      
      if (response.photos && response.photos.length > 0) {
        const imageUrl = response.photos[0].src.large;
        this.logger.log(`✅ Found image for ${plantName}: ${imageUrl}`);
        return imageUrl;
      }

      this.logger.warn(`⚠️ No images found for plant: ${plantName}`);
      return null;
    } catch (error) {
      this.logger.error(`❌ Error getting photo for plant: ${error.message}`);
      return null;
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
