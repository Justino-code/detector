// src/services/HealthCalculator.ts
import { DiseaseInfo, HealthAssessment } from '../../types/analysis';

export class HealthCalculator {
  calculateHealth(diseases: DiseaseInfo[]): Omit<HealthAssessment, 'diseases' | 'recommendations'> {
    const healthScore = this.calculateHealthScore(diseases);
    const status = this.determineHealthStatus(healthScore, diseases);
    const isHealthy = this.isPlantHealthy(healthScore, diseases);
    
    return {
      status: status,
      score: healthScore,
      isHealthy: isHealthy,
      healthScore: healthScore
    };
  }

  calculateHealthScore(diseases: DiseaseInfo[]): number {
    if (diseases.length === 0) return 100;
    
    let totalImpact = 0;
    let diseaseCount = 0;
    
    diseases.forEach(disease => {
      // Considerar apenas doenças com probabilidade significativa (>30%)
      if (disease.probability > 30) {
        let diseaseImpact = disease.probability;
        
        // Ajustar impacto baseado na severidade
        switch (disease.severity.toLowerCase()) {
          case 'high':
          case 'alta':
          case 'severe':
            diseaseImpact *= 1.5;
            break;
          case 'medium':
          case 'media':
          case 'moderate':
            diseaseImpact *= 1.2;
            break;
          case 'low':
          case 'baixa':
          case 'minor':
            diseaseImpact *= 0.8;
            break;
        }
        
        // Penalizar doenças com alta probabilidade (>70%)
        if (disease.probability > 70) {
          diseaseImpact *= 1.3;
        }
        
        totalImpact += diseaseImpact;
        diseaseCount++;
      }
    });
    
    // Se não houver doenças significativas, considera saudável
    if (diseaseCount === 0) return 85; // Retorna score bom, mas não perfeito
    
    const avgImpact = totalImpact / diseaseCount;
    const baseScore = Math.max(0, 100 - avgImpact);
    
    // Penaliza por múltiplas doenças
    const multipleDiseasePenalty = diseaseCount > 1 ? (diseaseCount - 1) * 5 : 0;
    
    // Penaliza por doenças críticas
    const criticalDiseasePenalty = diseases.some(d => 
      d.probability > 80 && d.severity.toLowerCase() === 'high'
    ) ? 15 : 0;
    
    const finalScore = Math.max(0, baseScore - multipleDiseasePenalty - criticalDiseasePenalty);
    
    return Math.round(finalScore);
  }

  determineHealthStatus(healthScore: number, diseases: DiseaseInfo[]): 'healthy' | 'warning' | 'critical' {
    // Verificar se há doenças críticas
    const hasCriticalDisease = diseases.some(disease => 
      disease.probability > 75 && (
        disease.severity.toLowerCase() === 'high' || 
        disease.severity.toLowerCase() === 'alta' ||
        disease.severity.toLowerCase() === 'severe'
      )
    );
    
    // Verificar se há múltiplas doenças com probabilidade média/alta
    const significantDiseases = diseases.filter(d => 
      d.probability > 50 && 
      (d.severity.toLowerCase() === 'medium' || d.severity.toLowerCase() === 'alta')
    );
    const hasMultipleSignificantDiseases = significantDiseases.length >= 2;
    
    // Lógica de status baseada em múltiplos fatores
    if (hasCriticalDisease) {
      return 'critical';
    }
    
    if (hasMultipleSignificantDiseases) {
      return healthScore >= 60 ? 'warning' : 'critical';
    }
    
    // Baseado no score
    if (healthScore >= 80) return 'healthy';
    if (healthScore >= 50) return 'warning';
    return 'critical';
  }

  isPlantHealthy(healthScore: number, diseases: DiseaseInfo[]): boolean {
    // Verificar doenças críticas imediatamente
    const hasCriticalDisease = diseases.some(disease => 
      disease.probability > 80 && (
        disease.severity.toLowerCase() === 'high' || 
        disease.severity.toLowerCase() === 'severe'
      )
    );
    
    if (hasCriticalDisease) return false;
    
    // Verificar doenças com alta probabilidade e severidade média/alta
    const hasHighProbabilityDisease = diseases.some(disease => 
      disease.probability > 70 && 
      (disease.severity.toLowerCase() === 'medium' || 
       disease.severity.toLowerCase() === 'high' ||
       disease.severity.toLowerCase() === 'alta')
    );
    
    if (hasHighProbabilityDisease) return false;
    
    // Verificar múltiplas doenças significativas
    const significantDiseases = diseases.filter(d => 
      d.probability > 50 && 
      d.severity.toLowerCase() !== 'low'
    );
    
    if (significantDiseases.length >= 2) return false;
    
    // Baseado no score
    return healthScore >= 75;
  }

  calculateDiseaseImpact(diseases: DiseaseInfo[]): number {
    if (diseases.length === 0) return 0;
    
    return diseases.reduce((total, disease) => {
      let impact = disease.probability;
      
      // Multiplicadores de severidade
      switch (disease.severity.toLowerCase()) {
        case 'high':
        case 'alta':
        case 'severe':
          impact *= 1.5;
          break;
        case 'medium':
        case 'media':
        case 'moderate':
          impact *= 1.2;
          break;
        case 'low':
        case 'baixa':
        case 'minor':
          impact *= 0.8;
          break;
      }
      
      return total + impact;
    }, 0) / diseases.length;
  }

  getHealthLevelDescription(score: number, diseases: DiseaseInfo[]): string {
    const hasCritical = diseases.some(d => 
      d.probability > 80 && d.severity.toLowerCase() === 'high'
    );
    
    if (hasCritical) return 'Estado crítico - ação imediata necessária';
    
    if (score >= 90) return 'Excelente saúde - planta vigorosa';
    if (score >= 75) return 'Boa saúde - condições favoráveis';
    if (score >= 60) return 'Saúde moderada - atenção recomendada';
    if (score >= 40) return 'Saúde preocupante - intervenção necessária';
    return 'Saúde crítica - cuidados urgentes';
  }

  generateHealthSummary(healthScore: number, diseases: DiseaseInfo[]): string {
    const diseaseCount = diseases.length;
    const criticalDiseases = diseases.filter(d => 
      d.probability > 70 && d.severity.toLowerCase() === 'high'
    ).length;
    
    const highRiskDiseases = diseases.filter(d => 
      d.probability > 60 && 
      (d.severity.toLowerCase() === 'high' || d.severity.toLowerCase() === 'medium')
    ).length;
    
    if (diseaseCount === 0) {
      return 'Planta completamente saudável sem problemas detectados.';
    }
    
    if (criticalDiseases > 0) {
      return `⚠️ ${criticalDiseases} doença(s) crítica(s) detectada(s). Ação imediata necessária.`;
    }
    
    if (highRiskDiseases > 0) {
      return `⚠️ ${highRiskDiseases} doença(s) de alto risco detectada(s). Monitoramento intensivo recomendado.`;
    }
    
    if (healthScore >= 70) {
      return `✅ Saúde geral boa. ${diseaseCount} problema(s) menor(es) identificado(s).`;
    }
    
    return `⚠️ Saúde comprometida. ${diseaseCount} problema(s) identificado(s) requerem atenção.`;
  }
}