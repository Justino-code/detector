// src/components/history/HistoryCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import Card from '../common/cards/Card';
import Typography from '../common/typography/Typography';
import Chip from '../common/chips/Chip';
import { HistoryItem } from '../../utils/storage/historyStorage';
import { isFavorite, toggleFavorite } from '../../services/historyStorageService';

interface HistoryCardProps {
  item: HistoryItem;
  onPress: () => void;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  forceRefresh?: () => void; // ADICIONAR ESTA PROP
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onPress, onFavoriteToggle, forceRefresh }) => {
  const { currentTheme, makeStyles } = useTheme();
  const [isFavorited, setIsFavorited] = useState(false);
  
  const styles = makeStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.sm,
    },
    cardContent: {
      flexDirection: 'row',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: item.analysis.health.isHealthy ? theme.colors.successLight : theme.colors.warningLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.xs,
    },
    plantName: {
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    healthScore: {
      color: item.analysis.health.isHealthy ? theme.colors.success : theme.colors.warning,
      fontWeight: 'bold',
    },
    scientificName: {
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.xs,
    },
    details: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginTop: theme.spacing.xs,
    },
    date: {
      color: theme.colors.textSecondary,
      fontSize: 12,
    },
    favoriteButton: {
      padding: 4,
      marginLeft: theme.spacing.sm,
    },
    diseasesCount: {
      color: theme.colors.error,
      fontSize: 11,
      fontWeight: '500',
    },
  }));

  useEffect(() => {
    checkFavoriteStatus();
  }, [item.id]);

  const checkFavoriteStatus = async () => {
    const favorited = await isFavorite(item.id);
    setIsFavorited(favorited);
  };

  const handleFavoritePress = async () => {
    try {
      const newFavoriteStatus = await toggleFavorite(item.id);
      setIsFavorited(newFavoriteStatus);
      
      if (onFavoriteToggle) {
        onFavoriteToggle(item.id, newFavoriteStatus);
      }
      
      // FORÇAR ATUALIZAÇÃO IMEDIATA
      if (forceRefresh) {
        forceRefresh();
      }
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar favorito.');
    }
  };

  const diseasesCount = item.analysis.health.diseases?.length || 0;
  const date = new Date(item.timestamp);
  const formattedDate = date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="medium" borderRadius="medium" style={styles.container}>
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Icon
              name={item.analysis.health.isHealthy ? 'leaf' : 'leaf-off'}
              size={24}
              color={item.analysis.health.isHealthy ? currentTheme.colors.success : currentTheme.colors.warning}
            />
          </View>
          
          <View style={styles.content}>
            <View style={styles.header}>
              <Typography variant="h4" style={styles.plantName} numberOfLines={1}>
                {item.analysis.identification.commonName}
              </Typography>
              
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  handleFavoritePress();
                }}
                style={styles.favoriteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name={isFavorited ? 'star' : 'star-outline'}
                  size={20}
                  color={isFavorited ? currentTheme.colors.warning : currentTheme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            <Typography variant="caption" style={styles.scientificName} numberOfLines={1}>
              {item.analysis.identification.scientificName}
            </Typography>
            
            <Typography variant="body2" style={styles.healthScore}>
              Saúde: {item.analysis.health.healthScore}/100
            </Typography>
            
            <View style={styles.details}>
              <Chip
                label={item.analysis.health.isHealthy ? 'Saudável' : 'Com problemas'}
                icon={item.analysis.health.isHealthy ? 'check-circle' : 'alert-circle'}
                variant="filled"
                size="small"
                style={{
                  backgroundColor: item.analysis.health.isHealthy 
                    ? currentTheme.colors.successLight 
                    : currentTheme.colors.warningLight,
                }}
                textStyle={{
                  color: item.analysis.health.isHealthy 
                    ? currentTheme.colors.success 
                    : currentTheme.colors.warning,
                }}
              />
              
              {diseasesCount > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="alert" size={14} color={currentTheme.colors.error} />
                  <Typography variant="caption" style={styles.diseasesCount}>
                    {diseasesCount} doença{diseasesCount > 1 ? 's' : ''}
                  </Typography>
                </View>
              )}
              
              <Typography variant="caption" style={styles.date}>
                {formattedDate}
              </Typography>
            </View>
          </View>
          
          <Icon
            name="chevron-right"
            size={20}
            color={currentTheme.colors.textSecondary}
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};

export default HistoryCard;