// src/services/ErrorHandler.ts
import { CompleteAnalysis } from '../../types/analysis';
import { MockAnalysisService } from './MockAnalysisService';

export class ErrorHandler {
  private mockService: MockAnalysisService;

  constructor() {
    this.mockService = new MockAnalysisService();
  }

  handleAnalysisError(
    error: any,
    imageUri: string,
    location?: any,
    allowSimulation: boolean = false
  ): CompleteAnalysis {
    console.error('❌ Erro na análise:', error);

    if (allowSimulation) {
      console.log('🔄 Retornando análise simulada como fallback');
      return this.mockService.simulateCompleteAnalysis(imageUri, location);
    }

    // Se não permitir simulação, lança erro com mensagem amigável
    throw new Error(
      'Não foi possível analisar a imagem. ' +
      'Verifique sua conexão com a internet e tente novamente.'
    );
  }

  handleQuickAnalysisError(
    error: any,
    allowSimulation: boolean = false
  ): PlantIdentification {
    console.error('❌ Erro na análise rápida:', error);

    if (allowSimulation) {
      return this.mockService.simulateQuickAnalysis();
    }

    throw new Error(
      this.getErrorMessage(error)
    );
  }

  getErrorMessage(error: any): string {
    if (error.response?.status === 401) {
      return 'Ocorreu um erro inesperado. Contacte o suporte.';
    }
    if (error.response?.status === 403) {
      return 'Limite de requisições excedido. Tente amanhã.';
    }
    if (error.message?.includes('network') || error.message?.includes('conexão')) {
      return 'Sem conexão à internet. Verifique sua rede.';
    }
    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}