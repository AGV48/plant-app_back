export class PlantDto {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  imageUrl?: string;
  category: string;
  careLevel: 'easy' | 'medium' | 'hard';
  wateringFrequency: string;
  sunlightRequirement: string;
  temperature: string;
  commonDiseases?: string[];
}

export class CreatePlantDto {
  name: string;
  scientificName: string;
  description: string;
  imageUrl?: string;
  category: string;
  careLevel: 'easy' | 'medium' | 'hard';
  wateringFrequency: string;
  sunlightRequirement: string;
  temperature: string;
  commonDiseases?: string[];
}

export class UpdatePlantDto {
  name?: string;
  scientificName?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  careLevel?: 'easy' | 'medium' | 'hard';
  wateringFrequency?: string;
  sunlightRequirement?: string;
  temperature?: string;
  commonDiseases?: string[];
}
