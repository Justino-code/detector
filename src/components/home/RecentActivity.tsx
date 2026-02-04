// src/components/home/RecentActivity.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import Button from '../common/buttons/Button';
import Typography from '../common/typography/Typography';
import Card from '../common/cards/Card';
import Chip from '../common/chips/Chip';
import { getRecentAnalyses } from '../../services/historyStorageService';

interface RecentActivityProps {
  onViewMore: () => void;
}

interface ActivityItem {
  id: string;
  timestamp: string;
  plantName: string;
  healthScore: number;
  isHealthy: boolean;
  hasDiseases: boolean;
  analysisData?: any;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ onViewMore }) => {
  const navigation = useNavigation();
  const { currentTheme, makeStyles } = useTheme();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const styles = makeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.large,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    activityHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    activityTitle: {
      color: theme.colors.text,
    },
    noActivity: {
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    noActivityText: {
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    activitiesList: {
      gap: theme.spacing.sm,
    },
    activityCard: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      marginBottom: theme.spacing.xs, // ESPAÇAMENTO ENTRE CARDS
    },
    activityRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start', // ALTERADO: flex-start para alinhar topo
      marginBottom: theme.spacing.xs,
    },
    plantInfo: {
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    plantName: {
      color: theme.colors.text,
      fontWeight: '600',
      fontSize: 15,
      marginBottom: 2,
    },
    activityTime: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    healthScore: (isHealthy: boolean) => ({
      color: isHealthy ? theme.colors.success : theme.colors.warning,
      fontWeight: '700',
      fontSize: 16,
      marginBottom: 4,
    }),
    loadingContainer: {
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: theme.spacing.xs,
    },
    diseaseIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  }));

  // Função para carregar atividades
  const loadRecentActivities = useCallback(async () => {
    try {
      setLoading(true);
      const analyses = await getRecentAnalyses(3);
      
      const activities: ActivityItem[] = analyses.map((analysis) => {
        const plantName = getPlantName(analysis);
        const healthScore = getHealthScore(analysis);
        const isHealthy = getIsHealthy(analysis);
        const hasDiseases = getHasDiseases(analysis);

        return {
          id: analysis.id,
          timestamp: analysis.timestamp,
          plantName,
          healthScore,
          isHealthy,
          hasDiseases,
          analysisData: analysis,
        };
      });

      setRecentActivities(activities);
    } catch (error) {
      console.error('Erro ao carregar atividades recentes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar inicialmente
  useEffect(() => {
    loadRecentActivities();
  }, [loadRecentActivities]);

  // Recarregar quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadRecentActivities();
    }, [loadRecentActivities])
  );

  const getPlantName = (analysis: any) => {
    if (!analysis?.analysis?.identification) return 'Planta não identificada';
    const identification = analysis.analysis.identification;
    return identification.commonNames?.[0] || identification.name || 'Planta não identificada';
  };

  const getHealthScore = (analysis: any) => {
    if (!analysis?.analysis?.health) return 0;
    return analysis.analysis.health.score || analysis.analysis.health.healthScore || 0;
  };

  const getIsHealthy = (analysis: any) => {
    return analysis?.analysis?.health?.isHealthy || false;
  };

  const getHasDiseases = (analysis: any) => {
    return analysis?.analysis?.health?.diseases?.length > 0 || false;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
      return 'Agora mesmo';
    } else if (diffMins < 60) {
      return `${diffMins} min atrás`;
    } else if (diffHours < 24) {
      return `${diffHours}h atrás`;
    } else if (diffDays === 1) {
      return 'Ontem';
    } else {
      return `${diffDays} dias atrás`;
    }
  };

  const handleActivityPress = (activity: ActivityItem) => {
    if (!activity.analysisData || !activity.analysisData.analysis) {
      Alert.alert('Erro', 'Dados da análise estão incompletos.');
      return;
    }

    navigation.navigate('AnalysisDetail', {
      analysisId: activity.id,
      analysisData: activity.analysisData,
    });
  };

  const handleStartAnalysis = () => {
    navigation.navigate('Detection');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.activityHeader}>
          <Typography variant="h4" style={styles.activityTitle}>
            📅 Actividades Recentes
          </Typography>
        </View>
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={24} color={currentTheme.colors.textSecondary} />
          <Typography variant="body2" style={{ color: currentTheme.colors.textSecondary, marginTop: 8 }}>
            Carregando...
          </Typography>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <Typography variant="h4" style={styles.activityTitle}>
          📅 Actividades Recentes
        </Typography>
        {recentActivities.length > 0 && (
          <Button
            variant="text"
            title="Ver mais"
            onPress={onViewMore}
            size="small"
          />
        )}
      </View>

      {recentActivities.length > 0 ? (
        <View style={styles.activitiesList}>
          {recentActivities.map((activity) => (
            <TouchableOpacity 
              key={activity.id}
              onPress={() => handleActivityPress(activity)}
              activeOpacity={0.7}
            >
              <Card
                variant="filled"
                padding="small"
                borderRadius="medium"
                style={styles.activityCard}
              >
                <View style={styles.activityRow}>
                  <View style={styles.plantInfo}>
                    <Typography 
                      variant="body1" 
                      numberOfLines={1}
                      style={styles.plantName}
                    >
                      {activity.plantName}
                    </Typography>
                    <Typography variant="caption" style={styles.activityTime}>
                      {formatTime(activity.timestamp)}
                    </Typography>
                  </View>
                  
                  <View style={{ alignItems: 'flex-end' }}>
                    <Typography variant="body1" style={styles.healthScore(activity.isHealthy)}>
                      {activity.healthScore}/100
                    </Typography>
                    <Chip
                      label={activity.isHealthy ? 'Saudável' : 'Atenção'}
                      icon={activity.isHealthy ? 'check-circle' : 'alert-circle'}
                      variant="filled"
                      size="small"
                      style={{
                        backgroundColor: activity.isHealthy 
                          ? `${currentTheme.colors.success}15` 
                          : `${currentTheme.colors.warning}15`,
                      }}
                      textStyle={{
                        color: activity.isHealthy 
                          ? currentTheme.colors.success 
                          : currentTheme.colors.warning,
                        fontSize: 10,
                      }}
                    />
                  </View>
                </View>
                
                <View style={styles.statusContainer}>
                  {activity.hasDiseases && (
                    <View style={styles.diseaseIndicator}>
                      <Icon name="alert" size={12} color={currentTheme.colors.error} />
                      <Typography variant="caption" style={{ 
                        color: currentTheme.colors.error,
                        fontSize: 11,
                      }}>
                        Problemas identificados
                      </Typography>
                    </View>
                  )}
                  <Icon 
                    name="chevron-right" 
                    size={16} 
                    color={currentTheme.colors.textSecondary} 
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.noActivity}>
          <Icon name="history" size={40} color={currentTheme.colors.textSecondary} />
          <Typography variant="body2" style={styles.noActivityText}>
            Nenhuma análise recente
          </Typography>
          <Button
            variant="outline"
            title="Fazer primeira análise"
            onPress={handleStartAnalysis}
            style={{ marginTop: currentTheme.spacing.md }}
            size="small"
          />
        </View>
      )}
    </View>
  );
};

export default RecentActivity;