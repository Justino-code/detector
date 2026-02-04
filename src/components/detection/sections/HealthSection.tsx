// src/components/detection/sections/HealthSection.tsx
import React from 'react';
import { View } from 'react-native';
import { CompleteAnalysis } from '../../../services/DetectionService';
import { useTheme } from '../../../hooks/useTheme';
import AnalysisResultCard from '../cards/AnalysisResultCard';
import HealthScoreMeter from '../HealthScoreMeter';
import Typography from '../../common/typography/Typography';

interface HealthSectionProps {
  analysis: CompleteAnalysis;
}

const HealthSection: React.FC<HealthSectionProps> = ({ analysis }) => {
  const { currentTheme } = useTheme();

  // Extrair dados da estrutura health
  const health = analysis.health;
  
  // Usar healthScore ou score (preferência para healthScore)
  const score = health.healthScore || health.score || 0;
  
  // Determinar status baseado no score - LÓGICA MELHORADA
  const getStatusFromScore = () => {
    if (score >= 80) return 'healthy';
    if (score >= 50) return 'warning';
    return 'critical';
  };
  
  const status = health.status || getStatusFromScore();
  const isHealthy = status === 'healthy';

  console.log('Health data:', { 
    score, 
    status, 
    isHealthy,
    healthScore: health.healthScore,
    originalScore: health.score 
  });

  // Configurar mensagens baseadas no status
  const getHealthConfig = () => {
    switch (status) {
      case 'healthy':
        return {
          label: score >= 90 ? 'Excelente' : score >= 80 ? 'Saudável' : 'Boa',
          message: health.diseases?.length === 0 
            ? 'A planta está em excelentes condições' 
            : 'Problemas mínimos detectados',
          description: health.recommendations?.join('. ') || 'Continue com os cuidados regulares.'
        };
      case 'warning':
        return {
          label: 'Atenção Necessária',
          message: health.diseases?.length > 0 
            ? `${health.diseases.length} problema(s) detectado(s)` 
            : 'Algumas condições podem melhorar',
          description: health.recommendations?.join('. ') || 'Recomenda-se monitoramento mais frequente.'
        };
      case 'critical':
        return {
          label: 'Ação Imediata',
          message: health.diseases?.length > 0 
            ? `${health.diseases.length} problema(s) graves detectados` 
            : 'Estado crítico identificado',
          description: health.recommendations?.join('. ') || 'Ação corretiva necessária imediatamente.'
        };
      default:
        return {
          label: 'Status Desconhecido',
          message: 'Análise realizada',
          description: 'Verifique os detalhes abaixo'
        };
    }
  };

  const healthConfig = getHealthConfig();

  // Determinar cor do ícone baseado no score
  const getIconColor = () => {
    if (score >= 80) return currentTheme.colors.success;
    if (score >= 50) return currentTheme.colors.warning;
    return currentTheme.colors.error;
  };

  return (
    <AnalysisResultCard
      title="Diagnóstico de Saúde"
      icon="heart-pulse"
      iconColor={getIconColor()}
    >
      <HealthScoreMeter
        score={score}
        isHealthy={isHealthy}
        label={healthConfig.label}
        message={healthConfig.message}
      />
      
      {healthConfig.description && (
        <View style={{ 
          marginTop: currentTheme.spacing.md, 
          padding: currentTheme.spacing.sm,
          backgroundColor: getIconColor() + '15', // Cor com transparência
          borderRadius: currentTheme.borderRadius.sm,
        }}>
          <Typography variant="body2" style={{ 
            color: currentTheme.colors.textSecondary,
            margin: 0,
            lineHeight: 20,
          }}>
            {healthConfig.description}
          </Typography>
        </View>
      )}
    </AnalysisResultCard>
  );
};

export default HealthSection;