// src/services/TreatmentGenerator.ts
import { DiseaseInfo, Treatment } from '../../types/analysis';
import { DiseaseClassifier } from './DiseaseClassifier';

export class TreatmentGenerator {
  private diseaseClassifier: DiseaseClassifier;

  constructor() {
    this.diseaseClassifier = new DiseaseClassifier();
  }

  generateTreatment(diseases: DiseaseInfo[], healthScore: number): Treatment {
    const hasDiseases = diseases.length > 0;

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

    if (hasDiseases) {
      treatment.products = [
        { 
          name: 'Óleo de Neem', 
          type: 'organic', 
          dosage: '5ml por litro de água' 
        },
        { 
          name: 'Fungicida/Inseticida', 
          type: 'chemical', 
          dosage: 'Seguir instruções do fabricante' 
        }
      ];
    }

    return treatment;
  }

  getDefaultTreatment(diseaseName: string): any {
    const diseaseType = this.diseaseClassifier.getDiseaseType(diseaseName);
    return {
      type: diseaseType,
      recommendations: this.diseaseClassifier.getTreatmentByType(diseaseType)
    };
  }

  getOrganicTreatments(diseaseType: string): string[] {
    return this.diseaseClassifier.getTreatmentByType(diseaseType).organic;
  }

  getChemicalTreatments(diseaseType: string): string[] {
    return this.diseaseClassifier.getTreatmentByType(diseaseType).chemical;
  }

  getPreventiveMeasures(diseaseType: string): string[] {
    return this.diseaseClassifier.getTreatmentByType(diseaseType).preventive;
  }
}