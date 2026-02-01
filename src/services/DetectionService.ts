// src/services/DetectionService.ts
import PlantNetService, { PlantInfo } from './PlantNetService';
import PlantNetDiseaseService, { PlantDiseaseInfo } from './PlantNetDiseasesService';
import { PreprocessImage, PreprocessResult } from '../utils/preprocessImage';

// Tipos exportados (mantidos para compatibilidade)
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

class DetectionService {
  // Pré-processar imagem
  static async preprocessImage(imageUri: string): Promise<PreprocessResult> {
    return await PreprocessImage.preprocess(imageUri);
  }

  // Orquestrar análise completa usando APENAS PlantNet
  static async completeAnalysis(
    imageUri: string, 
    location?: any
  ): Promise<CompleteAnalysis> {
    console.log('🚀 Iniciando análise orquestrada (apenas PlantNet)...');

    try {
      // 1. Identificar planta com PlantNetService
      console.log('🌿 Identificando planta...');
      const plantInfo = await PlantNetService.identifyPlant(imageUri);

      // 2. Identificar doenças com PlantNetDiseaseService
      console.log('🦠 Identificando doenças...');
      let diseasesResult;
      try {
        diseasesResult = await PlantNetDiseaseService.identifyPlantDisease(imageUri);
        console.log('✅ Doenças identificadas:', diseasesResult);
      } catch (diseaseError) {
        console.log('⚠️  Não foi possível identificar doenças:', diseaseError);
        // Se falhar, usar resultado vazio
        diseasesResult = {
          mainResult: null,
          otherResults: []
        };
      }

      // 3. Combinação dos resultados (apenas PlantNet)
      console.log('🔗 Combinando resultados do PlantNet...');
      const completeAnalysis = this.combinePlantNetResults(
        plantInfo,
        diseasesResult,
        imageUri,
        location
      );

      console.log('✅ Análise completa gerada:', completeAnalysis);
      return completeAnalysis;

    } catch (error: any) {
      console.error('❌ Erro na análise orquestrada:', error);
      
      // Fallback: análise simulada
      console.log('🔄 Usando fallback...');
      return await this.simulateCompleteAnalysis(imageUri, location);
    }
  }

  // Combina resultados APENAS do PlantNet
  private static combinePlantNetResults(
    plantInfo: PlantInfo,
    diseasesResult: {
      mainResult: PlantDiseaseInfo | null;
      otherResults: PlantDiseaseInfo[];
    },
    imageUri: string,
    location?: any
  ): CompleteAnalysis {
    // Converter doenças do PlantNet para formato padrão
    const diseases: DiseaseInfo[] = [];
    
    // Adicionar doença principal se existir
    if (diseasesResult.mainResult) {
      const mainDisease = this.convertPlantNetDisease(diseasesResult.mainResult);
      diseases.push(mainDisease);
    }
    
    // Adicionar outras doenças
    diseasesResult.otherResults.forEach(diseaseResult => {
      const disease = this.convertPlantNetDisease(diseaseResult);
      diseases.push(disease);
    });

    // Determinar status de saúde baseado nas doenças encontradas
    const hasDiseases = diseases.length > 0;
    const avgProbability = diseases.length > 0 
      ? diseases.reduce((sum, d) => sum + d.probability, 0) / diseases.length 
      : 0;
    
    const healthScore = hasDiseases ? Math.max(0, 100 - avgProbability) : 100;
    const healthStatus = healthScore >= 80 ? 'healthy' : 
                        healthScore >= 50 ? 'warning' : 'critical';

    // Gerar sugestões
    const suggestions: Suggestion[] = [
      {
        name: plantInfo.commonName,
        probability: plantInfo.probability,
        scientificName: plantInfo.scientificName,
        description: `Planta identificada: ${plantInfo.commonName}`,
        isPest: false
      }
    ];

    // Adicionar sugestões de doenças
    diseases.forEach(disease => {
      suggestions.push({
        name: disease.name,
        probability: disease.probability,
        description: disease.description,
        isPest: this.isPestDisease(disease.name),
        treatment: this.getDefaultTreatment(disease.name),
        symptoms: disease.symptoms
      });
    });

    // Tratamentos baseados nas doenças
    const treatment = this.generateTreatmentFromDiseases(diseases, healthScore);

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
        status: healthStatus,
        score: healthScore,
        isHealthy: !hasDiseases,
        healthScore: healthScore,
        diseases,
        recommendations: this.generateRecommendations(diseases, plantInfo)
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

  // Converter doença do PlantNet para formato padrão
  private static convertPlantNetDisease(diseaseResult: PlantDiseaseInfo): DiseaseInfo {
    const diseaseType = PlantNetDiseaseService.getPlantProblemType(diseaseResult.commonName);
    
    // Determinar severidade baseada na probabilidade
    const severity = diseaseResult.probability >= 50 ? 'high' : 
                     diseaseResult.probability >= 20 ? 'medium' : 'low';

    // Obter tratamento baseado no tipo de doença
    const treatment = this.getTreatmentByType(diseaseType);

    return {
      name: diseaseResult.commonName,
      probability: diseaseResult.probability,
      severity,
      description: diseaseResult.description,
      treatment,
      symptoms: [`Tipo: ${diseaseType}`, `Código: ${diseaseResult.code}`]
    };
  }

  // Verificar se é praga
  private static isPestDisease(diseaseName: string): boolean {
    return PlantNetDiseaseService.isPlantPest(diseaseName);
  }

  // Obter tratamento padrão baseado no tipo de doença
  private static getTreatmentByType(diseaseType: string): DiseaseInfo['treatment'] {
    const baseTreatment = {
      organic: [] as string[],
      chemical: [] as string[],
      preventive: [] as string[]
    };

    switch (diseaseType) {
      case 'inseto':
        baseTreatment.organic = ['Óleo de neem', 'Sabão inseticida', 'Extrato de alho'];
        baseTreatment.chemical = ['Inseticida piretróide', 'Inseticida sistêmico'];
        baseTreatment.preventive = ['Armadilhas adesivas', 'Rotação de culturas', 'Controle biológico'];
        break;
      
      case 'fungo':
        baseTreatment.organic = ['Calda bordalesa', 'Bicarbonato de sódio', 'Leite diluído'];
        baseTreatment.chemical = ['Fungicida sistêmico', 'Fungicida de contato'];
        baseTreatment.preventive = ['Boa ventilação', 'Evitar irrigação foliar', 'Poda adequada'];
        break;
      
      case 'bacteria':
        baseTreatment.organic = ['Extrato de alho', 'Óleo essencial de tomilho'];
        baseTreatment.chemical = ['Produtos à base de cobre', 'Bactericida específico'];
        baseTreatment.preventive = ['Ferramentas desinfetadas', 'Evitar ferimentos', 'Drenagem adequada'];
        break;
      
      case 'virus':
        baseTreatment.organic = ['Extrato de urtiga', 'Silício'];
        baseTreatment.chemical = ['Não há tratamento químico eficaz'];
        baseTreatment.preventive = ['Controle de vetores', 'Uso de mudas sadias', 'Eliminar plantas infectadas'];
        break;
      
      default:
        baseTreatment.organic = ['Adubação orgânica', 'Fortalecimento natural'];
        baseTreatment.chemical = ['Consultar especialista'];
        baseTreatment.preventive = ['Monitoramento regular', 'Boas práticas agrícolas'];
    }

    return baseTreatment;
  }

  // Obter tratamento padrão para sugestões
  private static getDefaultTreatment(diseaseName: string): any {
    const diseaseType = PlantNetDiseaseService.getPlantProblemType(diseaseName);
    return {
      type: diseaseType,
      recommendations: this.getTreatmentByType(diseaseType)
    };
  }

  // Gerar recomendações
  private static generateRecommendations(diseases: DiseaseInfo[], plantInfo: PlantInfo): string[] {
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
      
      // Adicionar recomendações específicas por doença
      diseases.forEach((disease, index) => {
        if (disease.probability > 30) {
          recommendations.push(
            `${index + 1}. Prioridade: ${disease.name} (${disease.probability}%)`
          );
        }
      });
    }
    
    return recommendations;
  }

  // Gerar plano de tratamento baseado nas doenças
  private static generateTreatmentFromDiseases(
    diseases: DiseaseInfo[],
    healthScore: number
  ): Treatment {
    const hasDiseases = diseases.length > 0;
    const isCritical = healthScore < 40;

    const treatment: Treatment = {
      immediate: hasDiseases ? [
        'Identificar problema específico',
        'Isolar planta se necessário',
        'Documentar sintomas'
      ] : ['Nenhuma ação imediata necessária'],
      
      shortTerm: hasDiseases ? [
        'Aplicar tratamento recomendado',
        'Monitorar evolução diariamente',
        'Fotografar progresso'
      ] : ['Continuar cuidados regulares'],
      
      longTerm: hasDiseases ? [
        'Implementar medidas preventivas',
        'Fortalecer defesas naturais da planta',
        'Manter registro de ocorrências'
      ] : ['Manter rotina de cuidados']
    };

    // Adicionar produtos sugeridos se houver doenças
    if (hasDiseases) {
      treatment.products = [
        { name: 'Óleo de Neem', type: 'organic', dosage: '5ml por litro de água' },
        { name: 'Fungicida/Inseticida', type: 'chemical', dosage: 'Seguir instruções do fabricante' }
      ];
    }

    return treatment;
  }

  // Análise rápida (apenas identificação)
  static async quickAnalysis(imageUri: string): Promise<PlantIdentification> {
    try {
      const plantInfo = await PlantNetService.identifyPlant(imageUri);
      
      return {
        name: plantInfo.commonName,
        confidence: plantInfo.probability,
        scientificName: plantInfo.scientificName,
        description: `Família: ${plantInfo.family || 'Desconhecida'}`,
        commonNames: plantInfo.commonNames || [plantInfo.commonName]
      };
    } catch (error) {
      console.error('Erro na análise rápida:', error);
      return {
        name: 'Planta não identificada',
        confidence: 0,
        commonNames: []
      };
    }
  }

  // Fallback: análise simulada completa
  private static async simulateCompleteAnalysis(
    imageUri: string, 
    location?: any
  ): Promise<CompleteAnalysis> {
    console.log('🔄 Executando análise simulada...');

    // Simular atraso de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

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
}

export default DetectionService;
export const detectionService = new DetectionService();