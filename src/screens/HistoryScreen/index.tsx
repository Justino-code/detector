// src/screens/HistoryScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/common/layout/ScreenContainer';
import HistoryList, { FilterType } from '../../components/history/HistoryList';
import Typography from '../../components/common/typography/Typography';
import Button from '../../components/common/buttons/Button';
import { 
  getHistory, 
  clearHistory, 
  getHistoryStats,
  HistoryItem,
  deleteFromHistory,
  getFavorites, // Certifique-se que esta função existe
} from '../../services/historyStorageService';

const HistoryScreen = ({ navigation, route }: any) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<HistoryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    unhealthy: 0,
  });
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]); // Estado para IDs dos favoritos

  const { currentTheme, makeStyles } = useTheme();
  const styles = makeStyles((theme) => ({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      color: theme.colors.textSecondary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: currentTheme.colors.surface,
      borderRadius: currentTheme.borderRadius.large,
      padding: currentTheme.spacing.md,
      marginBottom: currentTheme.spacing.md,
      marginHorizontal: currentTheme.spacing.md,
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: currentTheme.colors.primary,
      marginBottom: currentTheme.spacing.xs,
    },
    statLabel: {
      color: currentTheme.colors.textSecondary,
      fontSize: 12,
      textAlign: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: currentTheme.spacing.xl,
    },
    emptyIcon: {
      marginBottom: currentTheme.spacing.lg,
    },
    emptyText: {
      textAlign: 'center',
      marginBottom: currentTheme.spacing.lg,
      color: currentTheme.colors.textSecondary,
    },
  }));

  // Carregar histórico E favoritos
  const loadHistory = useCallback(async () => {
    try {
      const [history, historyStats, favorites] = await Promise.all([
        getHistory(),
        getHistoryStats(),
        getFavorites(), // Carregar favoritos
      ]);

      console.log(historyStats);
      
      
      setHistoryItems(history);
      setFavoriteIds(favorites);
      
      // Aplicar filtro atual com os favoritos carregados
      const filtered = await filterItems(activeFilter, history, favorites);
      setFilteredItems(filtered);
      
      setStats({
        total: historyStats.total,
        healthy: historyStats.healthy,
        unhealthy: historyStats.unhealthy,
      });
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      Alert.alert('Erro', 'Não foi possível carregar o histórico.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  // Filtrar itens (agora recebe favoriteIds como parâmetro)
  const filterItems = useCallback(async (
    filter: FilterType, 
    items: HistoryItem[], 
    favIds: string[]
  ): Promise<HistoryItem[]> => {
    let filtered = [...items];
    
    // Ordenar sempre por data mais recente primeiro
    filtered = [...filtered].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    switch (filter) {
      case 'healthy':
        filtered = filtered.filter(item => item.analysis.health.isHealthy);
        break;
      case 'unhealthy':
        filtered = filtered.filter(item => !item.analysis.health.isHealthy);
        break;
      case 'favorites':
        filtered = filtered.filter(item => favIds.includes(item.id));
        break;
      case 'recent':
        // Já está ordenado por data mais recente
        break;
      case 'all':
      default:
        // Mantém todos ordenados por data
        break;
    }
    
    return filtered;
  }, []);

  // Handler para mudança de filtro
  const handleFilterChange = useCallback(async (filter: FilterType) => {
    setActiveFilter(filter);
    const filtered = await filterItems(filter, historyItems, favoriteIds);
    setFilteredItems(filtered);
  }, [historyItems, favoriteIds, filterItems]);

  // Handler para refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadHistory();
  }, [loadHistory]);

  // Handler para pressionar item
  const handleItemPress = useCallback((item: HistoryItem) => {
    navigation.navigate('AnalysisDetail', { 
      analysisId: item.id,
      analysisData: item 
    });
  }, [navigation]);

  // Handler para iniciar detecção
  const handleStartDetection = useCallback(() => {
    navigation.navigate('Detection');
  }, [navigation]);

  // Handler para limpar histórico
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Limpar Histórico',
      'Tem certeza que deseja apagar todo o histórico? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar Tudo',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              await loadHistory();
              Alert.alert('Sucesso', 'Histórico limpo com sucesso!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar o histórico.');
            }
          },
        },
      ]
    );
  }, [loadHistory]);

  // Handler para deletar item
  const handleDeleteItem = useCallback(async (id: string) => {
    try {
      const success = await deleteFromHistory(id);
      if (success) {
        await loadHistory();
        Alert.alert('Sucesso', 'Análise removida do histórico.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover a análise.');
    }
  }, [loadHistory]);

  // Handler para toggle de favorito - ATUALIZADO
  const handleFavoriteToggle = useCallback(async (id: string, isFavorite: boolean) => {
    // Atualizar lista de favoritos localmente
    let updatedFavorites: string[];
    
    if (isFavorite) {
      // Adicionar aos favoritos
      updatedFavorites = [...favoriteIds, id];
    } else {
      // Remover dos favoritos
      updatedFavorites = favoriteIds.filter(favId => favId !== id);
    }
    
    setFavoriteIds(updatedFavorites);
    
    // Se estiver no filtro de favoritos, atualizar a lista filtrada
    if (activeFilter === 'favorites') {
      const filtered = await filterItems('favorites', historyItems, updatedFavorites);
      setFilteredItems(filtered);
    }
  }, [favoriteIds, activeFilter, historyItems, filterItems]);

  // Carregar histórico inicial
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Atualizar filtros quando histórico ou favoritos mudarem
  useEffect(() => {
    const updateFilteredItems = async () => {
      const filtered = await filterItems(activeFilter, historyItems, favoriteIds);
      setFilteredItems(filtered);
    };
    
    updateFilteredItems();
  }, [historyItems, activeFilter, favoriteIds, filterItems]);

  // Verificar se tem parâmetros de atualização
  useEffect(() => {
    if (route.params?.refresh) {
      loadHistory();
    }
  }, [route.params?.refresh, loadHistory]);

  // Recarregar quando a tela ganhar foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadHistory();
    });

    return unsubscribe;
  }, [navigation, loadHistory]);

  if (loading && !refreshing) {
    return (
      <ScreenContainer
        headerTitle="Histórico"
        scrollable={false}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={currentTheme.colors.primary} />
          <Typography variant="body1" style={styles.loadingText}>
            Carregando histórico...
          </Typography>
        </View>
      </ScreenContainer>
    );
  }

  const headerRight = (
    <View style={styles.headerActions}>
      <Button
        variant="text"
        iconLeft="delete"
        onPress={handleClearHistory}
        style={{ marginRight: currentTheme.spacing.xs }}
      />
    </View>
  );

  return (
    <ScreenContainer
      headerTitle="Histórico"
      headerSubtitle={`${stats.total} análise${stats.total !== 1 ? 's' : ''}`}
      headerRight={stats.total > 0 ? headerRight : undefined}
      scrollable={false}
    >
      {stats.total > 0 ? (
        <>
          {/* Estatísticas */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Typography variant="h2" style={styles.statValue}>
                {stats.total}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                Total
              </Typography>
            </View>
            
            <View style={styles.statItem}>
              <Typography variant="h2" style={[styles.statValue, { color: currentTheme.colors.success }]}>
                {stats.healthy}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                Saudáveis
              </Typography>
            </View>
            
            <View style={styles.statItem}>
              <Typography variant="h2" style={[styles.statValue, { color: currentTheme.colors.warning }]}>
                {stats.unhealthy}
              </Typography>
              <Typography variant="caption" style={styles.statLabel}>
                Com problemas
              </Typography>
            </View>
          </View>

          {/* Lista de histórico */}
          <HistoryList
            items={filteredItems}
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onItemPress={handleItemPress}
            onStartDetection={handleStartDetection}
            onDeleteItem={handleDeleteItem}
            onFavoriteToggle={handleFavoriteToggle}
            loading={refreshing}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[currentTheme.colors.primary]}
                tintColor={currentTheme.colors.primary}
              />
            }
          />
        </>
      ) : (
        // Tela vazia
        <View style={styles.emptyContainer}>
          <Icon name="history" size={80} color={currentTheme.colors.textSecondary} style={styles.emptyIcon} />
          
          <Typography variant="h4" style={styles.emptyText}>
            Nenhuma análise no histórico
          </Typography>
          
          <Typography variant="body2" style={[styles.emptyText, { maxWidth: 300 }]}>
            Suas análises de plantas aparecerão aqui. 
            Comece fazendo sua primeira análise!
          </Typography>
          
          <Button
            variant="primary"
            title="Fazer Primeira Análise"
            iconLeft="camera"
            onPress={handleStartDetection}
            style={{ marginTop: currentTheme.spacing.lg }}
          />
        </View>
      )}
    </ScreenContainer>
  );
};

export default HistoryScreen;