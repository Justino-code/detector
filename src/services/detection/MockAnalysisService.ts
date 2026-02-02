// src/services/MockAnalysisService.ts
import { CompleteAnalysis, PlantIdentification } from '../../types/analysis';

export class MockAnalysisService {
  simulateCompleteAnalysis(imageUri: string, location?: any): CompleteAnalysis {
    console.log('🔄 Executando análise simulada...');

    // Simular atraso de processamento
    return {
      timestamp: new Date().toISOString(),
      identification: {
        name: 'Tomateiro (Lycopersicon esculentum)',
        confidence: 88,
        scientificName: 'Solanum lycopersicum',
        description: 'Planta frutífera da família das solanáceas',
        commonNames: ['Tomate', 'Tomateiro']
      },
      health: {
        status: 'warning',
        score: 65,
        isHealthy: false,
        healthScore: 65,
        diseases: [
          {
            name: 'Míldio do Tomateiro',
            probability: 78,
            severity: 'medium',
            description: 'Doença fúngica que causa manchas foliares e murcha',
            treatment: {
              organic: ['Calda bordalesa', 'Extrato de alho'],
              chemical: ['Fungicida sistêmico'],
              preventive: ['Boa ventilação', 'Evitar molhar folhas']
            },
            symptoms: ['Manchas foliares', 'Murcha das folhas']
          }
        ],
        recommendations: [
          'Aplicar fungicida preventivo',
          'Melhorar circulação de ar',
          'Monitorar evolução'
        ]
      },
      treatment: {
        immediate: ['Remover folhas afetadas'],
        shortTerm: ['Aplicar fungicida'],
        longTerm: ['Melhorar drenagem'],
        products: [
          { name: 'Fungicida X', type: 'chemical', dosage: '10ml/L' }
        ]
      },
      suggestions: [
        {
          name: 'Tomateiro',
          probability: 88,
          isPest: false
        },
        {
          name: 'Míldio',
          probability: 78,
          isPest: true
        }
      ],
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      } : undefined,
      imageUri
    };
  }

  simulateQuickAnalysis(): PlantIdentification {
    return {
      name: 'Tomateiro (Exemplo)',
      confidence: 75,
      scientificName: 'Solanum lycopersicum',
      description: 'Planta exemplo para demonstração',
      commonNames: ['Tomate', 'Tomateiro']
    };
  }
}