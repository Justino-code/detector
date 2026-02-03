// src/components/detection/buttons/AnalyzeButton.tsx
import React from 'react';
import Button from '../../common/buttons/Button';
import { useTheme } from '../../../hooks/useTheme';
import { useNetwork } from '../../../hooks/useNetwork';
import { useDetectionSimulation } from '../../../hooks/useDetectionSimulation';

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

  // ✅ agora é reativo
  const withSimulate = useDetectionSimulation();

  if (!hasImage || hasAnalysis) return null;

  // Se modo de simulação está ativo, não desabilita por falta de conexão
  const isDisabledByNetwork = !isOnline && !withSimulate;
  const isDisabled = disabled || loading || isDisabledByNetwork;

  // Texto do botão
  const buttonText = loading
    ? 'Analisando...'
    : !isOnline
    ? withSimulate
      ? 'Simular Análise'
      : 'Sem Conexão'
    : 'Analisar Imagem';

  // Ícone
  const iconName = !isOnline
    ? withSimulate
      ? 'simulate'
      : 'wifi-off'
    : 'magnify';

  return (
    <Button
      variant={!isOnline && withSimulate ? 'secondary' : 'primary'}
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
          : !isOnline && withSimulate
          ? currentTheme.colors.secondary
          : loading
          ? currentTheme.colors.primaryLight
          : currentTheme.colors.primary,
      }}
    />
  );
};

export default AnalyzeButton;
