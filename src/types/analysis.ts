// src/types/analysis.ts

export interface DiseaseInfo {
  name: string;
  probability: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: {
    organic: string[];
    chemical: string[];
    preventive: string[];
  };
  symptoms: string[];
}

export interface PlantIdentification {
  name: string;
  confidence: number;
  scientificName?: string;
  description?: string;
  commonNames: string[];
}

export interface HealthAssessment {
  status: 'healthy' | 'warning' | 'critical';
  score: number;
  isHealthy: boolean;
  healthScore: number;
  diseases: DiseaseInfo[];
  recommendations: string[];
}

export interface Treatment {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  products?: Array<{
    name: string;
    type: 'organic' | 'chemical';
    dosage: string;
  }>;
}

export interface Suggestion {
  name: string;
  probability: number;
  scientificName?: string;
  description?: string;
  isPest: boolean;
  treatment?: any;
  symptoms?: string;
}

export interface CompleteAnalysis {
  id?: string;
  timestamp: string;
  identification: PlantIdentification;
  health: HealthAssessment;
  treatment: Treatment;
  suggestions: Suggestion[];
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  imageUri?: string;
}