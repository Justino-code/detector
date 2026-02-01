// src/hooks/useDetectionHandlers.ts
import { useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CompleteAnalysis } from '../services/DetectionService';
import { saveToHistory, HistoryItem } from '../services/historyStorageService';
import { useDetection } from './useDetection';
import { 
  takePhoto as takePhotoUtil, 
  pickImageFromGallery, 
  requestLocationPermission 
} from '../utils/permissions';

interface UseDetectionHandlersProps {
  image: string | null;
  location: any;
  updateState: (updates: any) => void;
  navigation: any;
}

export const useDetectionHandlers = ({
  image,
  location,
  updateState,
  navigation,
}: UseDetectionHandlersProps) => {
  // ✅ Hook detect encapsula pré-processamento + detecção
  const { detect, loading } = useDetection();

  // Tirar foto
  const handleTakePhoto = useCallback(async () => {
    try {
      updateState({ locationLoading: true });

      const currentLocation = await requestLocationPermission();
      updateState({ location: currentLocation, locationLoading: false });

      const imageUri = await takePhotoUtil();
      if (imageUri) {
        updateState({ 
          image: imageUri, 
          analysis: null, 
          error: null 
        });

        setTimeout(() => {
          Alert.alert(
            'Foto capturada!',
            'Deseja analisar esta imagem agora?',
            [
              { text: 'Mais tarde', style: 'cancel' },
              { text: 'Analisar', onPress: () => handleAnalyzeImage(imageUri, currentLocation) }
            ]
          );
        }, 500);
      }
    } catch (err) {
      console.error('Erro ao tirar foto:', err);
      updateState({ locationLoading: false });
    }
  }, [updateState, handleAnalyzeImage]);

  // Selecionar imagem da galeria
  const handlePickImage = useCallback(async () => {
    try {
      const imageUri = await pickImageFromGallery();
      if (imageUri) {
        updateState({ 
          image: imageUri, 
          analysis: null, 
          error: null 
        });
      }
    } catch (err) {
      console.error('Erro ao selecionar imagem:', err);
    }
  }, [updateState]);

  // Analisar imagem usando detect()
  const handleAnalyzeImage = useCallback(async (imageUri?: string, currentLocation?: any) => {
    const targetImage = imageUri || image;
    const targetLocation = currentLocation || location;

    if (!targetImage) {
      Alert.alert('Sem imagem', 'Selecione uma imagem primeiro');
      return;
    }

    updateState({ loading: true, error: null });

    try {
      // ✅ pré-processamento + detecção
      const completeAnalysis: CompleteAnalysis = await detect(targetImage);

      const historyItem: Omit<HistoryItem, 'id'> = {
        timestamp: new Date().toISOString(),
        imageUri: targetImage,
        analysis: completeAnalysis,
        location: targetLocation ? {
          latitude: targetLocation.coords.latitude,
          longitude: targetLocation.coords.longitude,
          accuracy: targetLocation.coords.accuracy,
        } : undefined,
      };

      const savedId = await saveToHistory(historyItem);

      const enrichedAnalysis = {
        ...completeAnalysis,
        id: savedId,
        location: historyItem.location,
      };

      updateState({ analysis: enrichedAnalysis, loading: false });

      await AsyncStorage.setItem('last_analysis', JSON.stringify(enrichedAnalysis));
    } catch (err: any) {
      console.error('Erro na análise:', err);
      updateState({ error: err.message || 'Erro na análise da imagem', loading: false });
      Alert.alert('Erro', 'Não foi possível analisar a imagem. Tente novamente.');
    }
  }, [image, location, updateState, detect]);

  // Salvar nos favoritos
  const handleSaveToFavorites = useCallback(async (analysis: CompleteAnalysis) => {
    try {
      const favorites = await AsyncStorage.getItem('favorite_analyses');
      const favoritesArray = favorites ? JSON.parse(favorites) : [];

      favoritesArray.unshift({
        ...analysis,
        savedAt: new Date().toISOString(),
        id: `fav_${Date.now()}`,
      });

      await AsyncStorage.setItem('favorite_analyses', JSON.stringify(favoritesArray));
      Alert.alert('✅ Salvo!', 'Análise adicionada aos favoritos.');
    } catch (error) {
      console.error('Erro ao salvar favorito:', error);
      Alert.alert('Erro', 'Não foi possível salvar nos favoritos.');
    }
  }, []);

  // Compartilhar resultados
  const handleShareResults = useCallback((analysis: CompleteAnalysis) => {
    Alert.alert(
      'Compartilhar Resultados',
      'Esta funcionalidade permitiria compartilhar os resultados por email, WhatsApp, etc.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Simular', onPress: () => {
          Alert.alert('Compartilhado!', 'Resultados prontos para compartilhar.');
        }}
      ]
    );
  }, []);

  // Resetar análise
  const handleResetAnalysis = useCallback((resetFn: () => void) => {
    Alert.alert(
      'Nova Análise',
      'Deseja começar uma nova análise?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim', onPress: resetFn }
      ]
    );
  }, []);

  // Abrir modal de imagem
  const handleOpenImageModal = useCallback((imageUri: string) => {
    updateState({ imageModalVisible: true });
  }, [updateState]);

  return {
    loading, // ✅ estado do hook detect
    handleTakePhoto,
    handlePickImage,
    handleAnalyzeImage,
    handleSaveToFavorites,
    handleShareResults,
    handleResetAnalysis,
    handleOpenImageModal,
  };
};
