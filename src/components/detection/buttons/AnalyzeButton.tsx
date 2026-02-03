// src/components/detection/buttons/AnalyzeButton.tsx
import React from 'react';
import Button from '../../common/buttons/Button';
import { useTheme } from '../../../hooks/useTheme';
import { useNetwork } from '../../../hooks/useNetwork';
import DetectionService from '../../../services/DetectionService';

interface AnalyzeButtonProps {
  onPress: () => void;
  loading: boolean;
  disabled?: boolean;
  hasImage: boolean;
  hasAnalysis?: boolean;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  onPress,
  loading,
  disabled = false,
  hasImage,
  hasAnalysis = false,
}) => {
  const { currentTheme } = useTheme();
  const { isOnline } = useNetwork();

  // Obtém a configuração atual do DetectionService
  const currentSettings = DetectionService.getCurrentSettings();
  const withSimulate = currentSettings.simulation;

  if (!hasImage || hasAnalysis) return null;

  // Se modo de simulação está ativo, não desabilita por falta de conexão
  // Mas ainda pode ser desabilitado por outros motivos
  const isDisabledByNetwork = !isOnline && !withSimulate;
  const isDisabled = disabled || loading || isDisabledByNetwork;
  
  // Determina texto baseado no estado
  let buttonText = 'Analisar Imagem';
  if (loading) {
    buttonText = 'Analisando...';
  } else if (!isOnline) {
    buttonText = withSimulate ? 'Simular Análise' : 'Sem Conexão';
  }
  
  // Determina ícone baseado no estado
  const iconName = !isOnline ? (withSimulate ? 'simulate' : 'wifi-off') : 'magnify';

  return (
    <Button
      variant={!isOnline && withSimulate ? "secondary" : "primary"}
      title={buttonText}
      iconLeft={iconName}
      onPress={onPress}
      loading={loading}
      disabled={isDisabled}
      fullWidth
      style={{ 
        marginBottom: currentTheme.spacing.md,
        backgroundColor: isDisabled 
          ? currentTheme.colors.disabled
          : (!isOnline && withSimulate 
              ? currentTheme.colors.secondary 
              : (loading ? currentTheme.colors.primaryLight : currentTheme.colors.primary)
            )
      }}
    />
  );
};

export default AnalyzeButton;