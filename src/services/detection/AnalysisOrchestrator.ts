// src/services/AnalysisOrchestrator.ts
import PlantNetService from '../PlantNetService';
import PlantNetDiseaseService from '../PlantNetDiseasesService';
import { ResultCombiner } from './ResultCombiner';
import { MockAnalysisService } from './MockAnalysisService';
import { CompleteAnalysis, PlantIdentification } from '../../types/analysis';

export class AnalysisOrchestrator {
  private resultCombiner: ResultCombiner;
  private mockService: MockAnalysisService;

  constructor() {
    this.resultCombiner = new ResultCombiner();
    this.mockService = new MockAnalysisService();
  }

  async orchestrateAnalysis(
    imageUri: string,
    location?: any,
    allowSimulation: boolean = false
  ): Promise<CompleteAnalysis> {
    console.log('🔗 Orquestrando análise...');

    // Se simulação permitida, retorna dados mockados
    if (allowSimulation) {
      console.log('🔄 Usando análise simulada');
      return this.mockService.simulateCompleteAnalysis(imageUri, location);
    }

    // Delega identificação da planta
    const plantInfo = await PlantNetService.identifyPlant(imageUri);

    // Delega identificação de doenças (com tratamento de erro interno)
    const diseasesResult = await this.getDiseasesResult(imageUri);

    // Delega combinação de resultados
    return this.resultCombiner.combineResults(
      plantInfo,
      diseasesResult,
      imageUri,
      location
    );
  }

  async performQuickAnalysis(
    imageUri: string,
    allowSimulation: boolean = false
  ): Promise<PlantIdentification> {
    if (allowSimulation) {
      return this.mockService.simulateQuickAnalysis();
    }

    // Delega para o serviço de planta
    const plantInfo = await PlantNetService.identifyPlant(imageUri);
    
    // Formata resultado
    return {
      name: plantInfo.commonName,
      confidence: plantInfo.probability,
      scientificName: plantInfo.scientificName,
      description: `Família: ${plantInfo.family || 'Desconhecida'}`,
      commonNames: plantInfo.commonNames || [plantInfo.commonName]
    };
  }

  private async getDiseasesResult(imageUri: string) {
    try {
      return await PlantNetDiseaseService.identifyPlantDisease(imageUri);
    } catch (error) {
      console.log('⚠️  Não foi possível identificar doenças');
      return { mainResult: null, otherResults: [] };
    }
  }
}