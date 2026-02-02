// src/services/ResultCombiner.ts
import { PlantInfo } from '../PlantNetService';
import { PlantDiseaseInfo } from '../PlantNetDiseasesService';
import { DiseaseClassifier } from './DiseaseClassifier';
import { TreatmentGenerator } from './TreatmentGenerator';
import { HealthCalculator } from './HealthCalculator';
import { CompleteAnalysis, DiseaseInfo, Suggestion } from '../../types/analysis';

export class ResultCombiner {
  private diseaseClassifier: DiseaseClassifier;
  private treatmentGenerator: TreatmentGenerator;
  private healthCalculator: HealthCalculator;

  constructor() {
    this.diseaseClassifier = new DiseaseClassifier();
    this.treatmentGenerator = new TreatmentGenerator();
    this.healthCalculator = new HealthCalculator();
  }

  combineResults(
    plantInfo: PlantInfo,
    diseasesResult: {
      mainResult: PlantDiseaseInfo | null;
      otherResults: PlantDiseaseInfo[];
    },
    imageUri: string,
    location?: any
  ): CompleteAnalysis {
    console.log('🔗 Combinando resultados...');

    // 1. Converter doenças para formato padrão
    const diseases = this.convertDiseases(diseasesResult);

    // 2. Calcular saúde
    const healthAssessment = this.healthCalculator.calculateHealth(diseases);

    // 3. Gerar sugestões
    const suggestions = this.generateSuggestions(plantInfo, diseases);

    // 4. Gerar tratamento
    const treatment = this.treatmentGenerator.generateTreatment(diseases, healthAssessment.score);

    // 5. Gerar recomendações
    const recommendations = this.generateRecommendations(diseases, plantInfo);

    // 6. Montar análise completa
    return {
      timestamp: new Date().toISOString(),
      identification: {
        name: plantInfo.commonName,
        confidence: plantInfo.probability,
        scientificName: plantInfo.scientificName,
        description: `Família: ${plantInfo.family || 'Desconhecida'}`,
        commonNames: plantInfo.commonNames || [plantInfo.commonName]
      },
      health: {
        ...healthAssessment,
        diseases,
        recommendations
      },
      treatment,
      suggestions,
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      } : undefined,
      imageUri
    };
  }

  private convertDiseases(diseasesResult: {
    mainResult: PlantDiseaseInfo | null;
    otherResults: PlantDiseaseInfo[];
  }): DiseaseInfo[] {
    const diseases: DiseaseInfo[] = [];
    
    if (diseasesResult.mainResult) {
      diseases.push(this.diseaseClassifier.classifyDisease(diseasesResult.mainResult));
    }
    
    diseasesResult.otherResults.forEach(diseaseResult => {
      diseases.push(this.diseaseClassifier.classifyDisease(diseaseResult));
    });

    return diseases;
  }

  private generateSuggestions(plantInfo: PlantInfo, diseases: DiseaseInfo[]): Suggestion[] {
    const suggestions: Suggestion[] = [
      {
        name: plantInfo.commonName,
        probability: plantInfo.probability,
        scientificName: plantInfo.scientificName,
        description: `Planta identificada: ${plantInfo.commonName}`,
        isPest: false
      }
    ];

    diseases.forEach(disease => {
      suggestions.push({
        name: disease.name,
        probability: disease.probability,
        description: disease.description,
        isPest: this.diseaseClassifier.isPestDisease(disease.name),
        treatment: this.treatmentGenerator.getDefaultTreatment(disease.name),
        symptoms: disease.symptoms
      });
    });

    return suggestions;
  }

  private generateRecommendations(diseases: DiseaseInfo[], plantInfo: PlantInfo): string[] {
    const recommendations: string[] = [];
    
    if (diseases.length === 0) {
      recommendations.push(
        'Planta parece saudável',
        'Continue com os cuidados regulares',
        'Monitore regularmente'
      );
    } else {
      recommendations.push(
        `Foram identificadas ${diseases.length} doença(s) potencial(is)`,
        'Considere aplicar tratamento recomendado',
        'Monitore a evolução diariamente',
        `Planta identificada: ${plantInfo.commonName}`
      );
      
      diseases.forEach((disease, index) => {
        if (disease.probability > 30) {
          recommendations.push(`${index + 1}. Prioridade: ${disease.name} (${disease.probability}%)`);
        }
      });
    }
    
    return recommendations;
  }
}