// src/services/DetectionService.ts
import { CompleteAnalysis, PlantIdentification } from '../types/analysis';

import { 
  ImagePreprocessor, 
  AnalysisOrchestrator, 
  ErrorHandler 
} from './detection';

class DetectionService {
  private static imagePreprocessor: ImagePreprocessor = new ImagePreprocessor();
  private static analysisOrchestrator: AnalysisOrchestrator = new AnalysisOrchestrator();
  private static errorHandler: ErrorHandler = new ErrorHandler();

  // Configurações
  private static withPreprocess: boolean = true;
  private static withSimulate: boolean = false;

  // Método público para configurar modos
  static setSimulationMode(enabled: boolean): void {
    this.withSimulate = enabled;
    console.log(`Modo de simulação ${enabled ? 'ativado' : 'desativado'}`);
  }

  static setPreprocessingMode(enabled: boolean): void {
    this.withPreprocess = enabled;
    console.log(`Pré-processamento ${enabled ? 'ativado' : 'desativado'}`);
  }

  static getSimulationMode(): boolean{
    return this.withSimulate;
  }

  // Método principal de análise completa
  static async completeAnalysis(
    imageUri: string, 
    location?: any
  ): Promise<CompleteAnalysis> {
    console.log('🚀 Iniciando análise orquestrada...');

    try {
      // Apenas delega o pré-processamento se necessário
      const processedImageUri = this.withPreprocess 
        ? await this.imagePreprocessor.preprocess(imageUri)
        : imageUri;

      // Delega toda a orquestração
      return await this.analysisOrchestrator.orchestrateAnalysis(
        processedImageUri,
        location,
        this.withSimulate
      );

    } catch (error: any) {
      // Delega o tratamento de erro
      return this.errorHandler.handleAnalysisError(
        error,
        imageUri,
        location,
        this.withSimulate
      );
    }
  }

  // Análise rápida (delegação simples)
  static async quickAnalysis(imageUri: string): Promise<PlantIdentification> {
    try {
      return await this.analysisOrchestrator.performQuickAnalysis(
        imageUri,
        this.withSimulate
      );
    } catch (error: any) {
      throw this.errorHandler.handleQuickAnalysisError(error, this.withSimulate);
    }
  }

  static getCurrentSettings(): { simulation: boolean; preprocessing: boolean } {
    return {
      simulation: this.withSimulate,
      preprocessing: this.withPreprocess
    };
  }

}

export default DetectionService;
export const detectionService = new DetectionService();