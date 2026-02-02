// src/services/HealthCalculator.ts
import { DiseaseInfo, HealthAssessment } from '../../types/analysis';

export class HealthCalculator {
  calculateHealth(diseases: DiseaseInfo[]): Omit<HealthAssessment, 'diseases' | 'recommendations'> {
    const hasDiseases = diseases.length > 0;
    const healthScore = this.calculateHealthScore(diseases);
    
    return {
      status: this.determineHealthStatus(healthScore),
      score: healthScore,
      isHealthy: !hasDiseases,
      healthScore: healthScore
    };
  }

  calculateHealthScore(diseases: DiseaseInfo[]): number {
    if (diseases.length === 0) return 100;
    
    const avgProbability = diseases.reduce((sum, d) => sum + d.probability, 0) / diseases.length;
    return Math.max(0, 100 - avgProbability);
  }

  determineHealthStatus(healthScore: number): 'healthy' | 'warning' | 'critical' {
    if (healthScore >= 80) return 'healthy';
    if (healthScore >= 50) return 'warning';
    return 'critical';
  }

  calculateDiseaseImpact(diseases: DiseaseInfo[]): number {
    if (diseases.length === 0) return 0;
    
    return diseases.reduce((total, disease) => {
      let impact = disease.probability;
      if (disease.severity === 'high') impact *= 1.5;
      if (disease.severity === 'medium') impact *= 1.2;
      return total + impact;
    }, 0) / diseases.length;
  }

  getHealthLevelDescription(score: number): string {
    if (score >= 90) return 'Excelente saúde';
    if (score >= 70) return 'Boa saúde';
    if (score >= 50) return 'Saúde moderada';
    if (score >= 30) return 'Saúde preocupante';
    return 'Saúde crítica';
  }
}