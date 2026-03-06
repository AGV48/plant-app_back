export class DiseaseDto {
  id: string;
  name: string;
  type: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
  description: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
  imageUrl?: string;
  affectedPlants?: string[];
}

export class CreateDiseaseDto {
  name: string;
  type: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'deficiency';
  description: string;
  symptoms: string[];
  treatment: string;
  prevention: string;
  imageUrl?: string;
  affectedPlants?: string[];
}
