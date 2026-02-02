// src/services/historyStorageService.ts
import { storage } from './storage';
import { CompleteAnalysis } from '../types/analysis';

export interface HistoryItem {
  id: string;
  timestamp: string;
  imageUri: string;
  analysis: CompleteAnalysis; // ← Usa CompleteAnalysis diretamente
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

const HISTORY_STORAGE_KEY = '@plant_detector_history';
const FAVORITES_STORAGE_KEY = '@plant_detector_favorites';

// Salvar nova análise no histórico
export const saveToHistory = async (item: Omit<HistoryItem, 'id'>): Promise<string> => {
  try {
    const history = await getHistory();
    const id = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newItem: HistoryItem = {
      ...item,
      id,
    };
    
    const updatedHistory = [newItem, ...history];
    await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    
    return id;
  } catch (error) {
    console.error('Erro ao salvar no histórico:', error);
    throw error;
  }
};

// Converter CompleteAnalysis para HistoryItem (sem ID)
export const convertToHistoryItem = (
  completeAnalysis: CompleteAnalysis,
  imageUri: string,
  location?: any
): Omit<HistoryItem, 'id'> => {
  return {
    timestamp: completeAnalysis.timestamp || new Date().toISOString(),
    imageUri,
    analysis: completeAnalysis,
    location: location ? {
      latitude: location.coords?.latitude || location.latitude,
      longitude: location.coords?.longitude || location.longitude,
      accuracy: location.coords?.accuracy || location.accuracy,
    } : undefined,
  };
};

// Salvar CompleteAnalysis diretamente
export const saveCompleteAnalysis = async (
  completeAnalysis: CompleteAnalysis,
  imageUri: string,
  location?: any
): Promise<string> => {
  const historyItem = convertToHistoryItem(completeAnalysis, imageUri, location);
  return await saveToHistory(historyItem);
};

// Obter todo o histórico
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const historyJson = await storage.getItem(HISTORY_STORAGE_KEY);
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return [];
  }
};

// Obter análises recentes (últimas N análises)
export const getRecentAnalyses = async (limit: number = 3): Promise<HistoryItem[]> => {
  try {
    const history = await getHistory();
    
    // Ordenar por timestamp (mais recente primeiro)
    const sortedHistory = history.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    // Retornar apenas os 'limit' primeiros itens
    return sortedHistory.slice(0, limit);
  } catch (error) {
    console.error('Erro ao buscar análises recentes:', error);
    return [];
  }
};

// Obter análise específica por ID
export const getAnalysisById = async (id: string): Promise<HistoryItem | null> => {
  try {
    const history = await getHistory();
    return history.find(item => item.id === id) || null;
  } catch (error) {
    console.error('Erro ao obter análise:', error);
    return null;
  }
};

// Deletar análise do histórico
export const deleteFromHistory = async (id: string): Promise<boolean> => {
  try {
    const history = await getHistory();
    const filteredHistory = history.filter(item => item.id !== id);
    await storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filteredHistory));
    
    // Também remover dos favoritos se estiver lá
    await removeFromFavorites(id);
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar análise:', error);
    return false;
  }
};

// Limpar todo o histórico
export const clearHistory = async (): Promise<void> => {
  try {
    await storage.removeItem(HISTORY_STORAGE_KEY);
    await storage.removeItem(FAVORITES_STORAGE_KEY);
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    throw error;
  }
};

// Adicionar/remover dos favoritos
export const toggleFavorite = async (id: string): Promise<boolean> => {
  try {
    const favoritesJson = await storage.getItem(FAVORITES_STORAGE_KEY);
    let favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];
    
    if (favorites.includes(id)) {
      favorites = favorites.filter(favId => favId !== id);
    } else {
      favorites.push(id);
    }
    
    await storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    return favorites.includes(id); // Retorna se está favoritado
  } catch (error) {
    console.error('Erro ao alternar favorito:', error);
    return false;
  }
};

// Verificar se está favoritado
export const isFavorite = async (id: string): Promise<boolean> => {
  try {
    const favoritesJson = await storage.getItem(FAVORITES_STORAGE_KEY);
    const favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];
    return favorites.includes(id);
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    return false;
  }
};

// Obter apenas favoritos
export const getFavorites = async (): Promise<HistoryItem[]> => {
  try {
    const [history, favoritesJson] = await Promise.all([
      getHistory(),
      storage.getItem(FAVORITES_STORAGE_KEY),
    ]);
    
    const favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];
    return history.filter(item => favorites.includes(item.id));
  } catch (error) {
    console.error('Erro ao obter favoritos:', error);
    return [];
  }
};

// Remover dos favoritos
export const removeFromFavorites = async (id: string): Promise<void> => {
  try {
    const favoritesJson = await storage.getItem(FAVORITES_STORAGE_KEY);
    let favorites: string[] = favoritesJson ? JSON.parse(favoritesJson) : [];
    
    favorites = favorites.filter(favId => favId !== id);
    await storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Erro ao remover dos favoritos:', error);
  }
};

// Estatísticas do histórico
export const getHistoryStats = async () => {
  try {
    const history = await getHistory();
    
    return {
      total: history.length,
      healthy: history.filter(item => item.analysis.health.isHealthy).length,
      unhealthy: history.filter(item => !item.analysis.health.isHealthy).length,
      lastAnalysis: history[0] || null,
      byMonth: getAnalysesByMonth(history),
    };
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    return {
      total: 0,
      healthy: 0,
      unhealthy: 0,
      lastAnalysis: null,
      byMonth: [],
    };
  }
};

// Agrupar análises por mês
const getAnalysesByMonth = (history: HistoryItem[]) => {
  const byMonth: { [key: string]: number } = {};
  
  history.forEach(item => {
    const date = new Date(item.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
  });
  
  return Object.entries(byMonth)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month));
};

// Obter análises filtradas por status de saúde
export const getAnalysesByHealthStatus = async (isHealthy: boolean): Promise<HistoryItem[]> => {
  try {
    const history = await getHistory();
    return history.filter(item => item.analysis.health.isHealthy === isHealthy);
  } catch (error) {
    console.error('Erro ao filtrar análises por status:', error);
    return [];
  }
};

// Buscar análises por nome da planta
export const searchAnalysesByPlantName = async (searchTerm: string): Promise<HistoryItem[]> => {
  try {
    const history = await getHistory();
    const searchTermLower = searchTerm.toLowerCase();
    
    return history.filter(item => {
      const identification = item.analysis.identification;
      if (!identification) return false;
      
      const commonName = identification.commonNames?.[0] || '';
      const scientificName = identification.scientificName || '';
      const name = identification.name || '';
      
      return (
        commonName.toLowerCase().includes(searchTermLower) ||
        scientificName.toLowerCase().includes(searchTermLower) ||
        name.toLowerCase().includes(searchTermLower)
      );
    });
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    return [];
  }
};

// Obter total de análises por período (últimos 30 dias)
export const getAnalysesCountByPeriod = async (days: number = 30): Promise<number> => {
  try {
    const history = await getHistory();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return history.filter(item => {
      const analysisDate = new Date(item.timestamp);
      return analysisDate >= cutoffDate;
    }).length;
  } catch (error) {
    console.error('Erro ao contar análises por período:', error);
    return 0;
  }
};