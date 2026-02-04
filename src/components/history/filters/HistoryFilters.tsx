// src/components/history/filters/HistoryFilters.tsx
import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../../hooks/useTheme';
import Chip from '../../common/chips/Chip';
import Typography from '../../common/typography/Typography';

export type FilterType = 'all' | 'healthy' | 'unhealthy' | 'recent' | 'favorites';

interface HistoryFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const HistoryFilters: React.FC<HistoryFiltersProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  const { currentTheme, makeStyles } = useTheme();
  const styles = makeStyles((theme) => ({
    container: {
      marginBottom: theme.spacing.md,
    },
    title: {
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    filtersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
    },
  }));

  const filters = [
    { id: 'all' as FilterType, label: 'Todas', icon: 'format-list-bulleted' },
    { id: 'healthy' as FilterType, label: 'Saudáveis', icon: 'check-circle' },
    { id: 'unhealthy' as FilterType, label: 'Com Problemas', icon: 'alert-circle' },
    //{ id: 'favorites' as FilterType, label: 'Favoritas', icon: 'star' },
    { id: 'recent' as FilterType, label: 'Recentes', icon: 'clock' },
  ];

  return (
    <View style={styles.container}>
      <Typography variant="h4" style={styles.title}>
        Filtrar
      </Typography>
      
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            icon={filter.icon}
            variant={activeFilter === filter.id ? 'filled' : 'outlined'}
            onPress={() => onFilterChange(filter.id)}
            style={
              activeFilter === filter.id
                ? { backgroundColor: currentTheme.colors.primary }
                : undefined
            }
            textStyle={
              activeFilter === filter.id
                ? { color: '#FFFFFF' }
                : undefined
            }
          />
        ))}
      </View>
    </View>
  );
};

export default HistoryFilters;