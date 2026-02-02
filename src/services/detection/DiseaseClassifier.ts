// src/services/DiseaseClassifier.ts
import PlantNetDiseaseService from '../PlantNetDiseasesService';
import { PlantDiseaseInfo } from '../PlantNetDiseasesService';
import { DiseaseInfo } from '../../types/analysis';

export class DiseaseClassifier {
  classifyDisease(diseaseResult: PlantDiseaseInfo): DiseaseInfo {
    const diseaseType = PlantNetDiseaseService.getPlantProblemType(diseaseResult.commonName);
    
    return {
      name: diseaseResult.commonName,
      probability: diseaseResult.probability,
      severity: this.determineSeverity(diseaseResult.probability),
      description: diseaseResult.description,
      treatment: this.getTreatmentByType(diseaseType),
      symptoms: [`Tipo: ${diseaseType}`, `Código: ${diseaseResult.code}`]
    };
  }

  isPestDisease(diseaseName: string): boolean {
    return PlantNetDiseaseService.isPlantPest(diseaseName);
  }

  determineSeverity(probability: number): 'low' | 'medium' | 'high' {
    if (probability >= 50) return 'high';
    if (probability >= 20) return 'medium';
    return 'low';
  }

  getTreatmentByType(diseaseType: string): DiseaseInfo['treatment'] {
    const treatments: Record<string, DiseaseInfo['treatment']> = {
      inseto: {
        organic: ['Óleo de neem', 'Sabão inseticida', 'Extrato de alho'],
        chemical: ['Inseticida piretróide', 'Inseticida sistêmico'],
        preventive: ['Armadilhas adesivas', 'Rotação de culturas', 'Controle biológico']
      },
      fungo: {
        organic: ['Calda bordalesa', 'Bicarbonato de sódio', 'Leite diluído'],
        chemical: ['Fungicida sistêmico', 'Fungicida de contato'],
        preventive: ['Boa ventilação', 'Evitar irrigação foliar', 'Poda adequada']
      },
      bacteria: {
        organic: ['Extrato de alho', 'Óleo essencial de tomilho'],
        chemical: ['Produtos à base de cobre', 'Bactericida específico'],
        preventive: ['Ferramentas desinfetadas', 'Evitar ferimentos', 'Drenagem adequada']
      },
      virus: {
        organic: ['Extrato de urtiga', 'Silício'],
        chemical: ['Não há tratamento químico eficaz'],
        preventive: ['Controle de vetores', 'Uso de mudas sadias', 'Eliminar plantas infectadas']
      }
    };

    return treatments[diseaseType] || {
      organic: ['Adubação orgânica', 'Fortalecimento natural'],
      chemical: ['Consultar especialista'],
      preventive: ['Monitoramento regular', 'Boas práticas agrícolas']
    };
  }

  getDiseaseType(diseaseName: string): string {
    return PlantNetDiseaseService.getPlantProblemType(diseaseName);
  }
}