// src/services/detection/index.ts
export { ImagePreprocessor } from './ImagePreprocessor';
export { AnalysisOrchestrator } from './AnalysisOrchestrator';
export { ResultCombiner } from './ResultCombiner';
export { DiseaseClassifier } from './DiseaseClassifier';
export { TreatmentGenerator } from './TreatmentGenerator';
export { HealthCalculator } from './HealthCalculator';
export { MockAnalysisService } from './MockAnalysisService';
export { ErrorHandler } from './ErrorHandler';

// Tipos
export type { 
  DiseaseInfo, 
  PlantIdentification, 
  HealthAssessment, 
  Treatment, 
  Suggestion, 
  CompleteAnalysis 
} from '../../types/analysis';