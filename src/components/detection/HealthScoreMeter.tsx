// src/components/detection/HealthScoreMeter.tsx
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import Typography from '../common/typography/Typography';

interface HealthScoreMeterProps {
  score: number;
  isHealthy: boolean;
  label: string;
  message: string;
}

const HealthScoreMeter: React.FC<HealthScoreMeterProps> = ({
  score,
  isHealthy,
  label,
  message,
}) => {
  const { currentTheme, makeStyles } = useTheme();
  
  // FUNÇÃO PARA DETERMINAR A COR BASEADA NO SCORE
  const getScoreColor = () => {
    if (score >= 80) {
      return currentTheme.colors.success; // Verde para score alto
    } else if (score >= 50) {
      return currentTheme.colors.warning; // Amarelo para score médio
    } else {
      return currentTheme.colors.error; // Vermelho para score baixo
    }
  };

  const getIconName = () => {
    if (score >= 80) return 'check-circle';
    if (score >= 50) return 'alert-circle';
    return 'close-circle';
  };

  const styles = makeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    healthTextContainer: {
      flex: 1,
      marginLeft: theme.spacing.sm,
    },
    healthLabel: {
      // Usar função para determinar cor
      marginBottom: 2,
    },
    healthMessage: {
      color: theme.colors.textSecondary,
    },
    scoreContainer: {
      alignItems: 'center',
    },
    scoreLabel: {
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    scoreValue: {
      color: getScoreColor(), // Usar cor baseada no score
    },
    scoreTotal: {
      color: theme.colors.textSecondary,
    },
    healthBarContainer: {
      marginTop: theme.spacing.sm,
    },
    healthBarBackground: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    healthBarFill: {
      height: '100%',
      borderRadius: 4,
      // Usar função para determinar cor
    },
    healthBarLabel: {
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
  }));

  const getHealthLevel = () => {
    if (score >= 80) return 'Excelente';
    if (score >= 70) return 'Boa';
    if (score >= 50) return 'Moderada';
    if (score >= 30) return 'Baixa';
    return 'Crítica';
  };

  const scoreColor = getScoreColor();
  const iconName = getIconName();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon
          name={iconName}
          size={32}
          color={scoreColor}
        />
        <View style={styles.healthTextContainer}>
          <Typography variant="h4" style={[styles.healthLabel, { color: scoreColor }]}>
            {label}
          </Typography>
          <Typography variant="body2" style={styles.healthMessage}>
            {message}
          </Typography>
        </View>
        <View style={styles.scoreContainer}>
          <Typography variant="caption" style={styles.scoreLabel}>
            Pontuação
          </Typography>
          <Typography variant="h3" style={styles.scoreValue}>
            {score.toFixed(0)}
            <Typography variant="body2" style={styles.scoreTotal}>
              /100
            </Typography>
          </Typography>
        </View>
      </View>
      
      <View style={styles.healthBarContainer}>
        <View style={styles.healthBarBackground}>
          <View 
            style={[
              styles.healthBarFill,
              { 
                width: `${score}%`,
                backgroundColor: scoreColor
              }
            ]} 
          />
        </View>
        <Typography variant="caption" style={styles.healthBarLabel}>
          {getHealthLevel()} saúde
        </Typography>
      </View>
    </View>
  );
};

export default HealthScoreMeter;