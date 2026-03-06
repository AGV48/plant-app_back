import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class PlantIdService {
  private readonly apiUrl = 'https://perenual.com/api';
  private readonly apiKey = process.env.PERENUAL_API_KEY || 'sk-gf0F67c20a12f6b347955';

  // Obtener lista de especies con paginación
  async getSpeciesList(page: number = 1, query?: string): Promise<any> {
    try {
      let url = `${this.apiUrl}/species-list?key=${this.apiKey}&page=${page}`;
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          'Error al obtener la lista de especies',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener detalles de una especie específica
  async getSpeciesDetails(speciesId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/species/details/${speciesId}?key=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al obtener detalles de la especie',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Buscar plantas por nombre
  async searchPlants(searchTerm: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/species-list?key=${this.apiKey}&q=${encodeURIComponent(searchTerm)}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al buscar plantas',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener guías de cuidado
  async getCareGuides(speciesId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/species-care-guide-list?key=${this.apiKey}&species_id=${speciesId}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al obtener guías de cuidado',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener lista de plagas y enfermedades
  async getPestsDiseases(page: number = 1, query?: string): Promise<any> {
    try {
      let url = `${this.apiUrl}/pest-disease-list?key=${this.apiKey}&page=${page}`;
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new HttpException(
          'Error al obtener lista de plagas y enfermedades',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener detalles de una plaga o enfermedad
  async getPestDiseaseDetails(pestId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiUrl}/pest-disease-details/${pestId}?key=${this.apiKey}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al obtener detalles de plaga/enfermedad',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Filtrar por tipo (interior, exterior, etc.)
  async getPlantsByType(
    indoor: boolean = true,
    page: number = 1,
  ): Promise<any> {
    try {
      const indoorValue = indoor ? 1 : 0;
      const response = await fetch(
        `${this.apiUrl}/species-list?key=${this.apiKey}&indoor=${indoorValue}&page=${page}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al filtrar plantas',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Filtrar por toxicidad
  async getPlantsByToxicity(
    poisonous: boolean,
    page: number = 1,
  ): Promise<any> {
    try {
      const poisonousValue = poisonous ? 1 : 0;
      const response = await fetch(
        `${this.apiUrl}/species-list?key=${this.apiKey}&poisonous=${poisonousValue}&page=${page}`,
      );

      if (!response.ok) {
        throw new HttpException(
          'Error al filtrar plantas',
          HttpStatus.BAD_REQUEST,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Error al conectar con Perenual API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
