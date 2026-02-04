import { useState, useEffect } from 'react';
import { networkService } from '../services/network';

/**
 * Hook para monitorar o estado da rede
 * @returns {Object} Estado da rede e métodos úteis
 */
export const useNetwork = (): object => {
  const [networkState, setNetworkState] = useState({
    isConnected: false,
    isInternetReachable: false,
    type: 'unknown',
    details: null,
    isLoading: true
  });

  useEffect(() => {
    // Inicializa o serviço se ainda não estiver inicializado
    networkService.initialize();

    // Verifica o estado inicial
    networkService.checkConnection().then(state => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
        isLoading: false
      });
    });

    // Inscreve para receber atualizações
    const unsubscribe = networkService.subscribe(state => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
        isLoading: false
      });
    });

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ...networkState,
    isOnline: networkState.isConnected && networkState.isInternetReachable,
    isOffline: !networkState.isConnected,
    isWiFi: networkState.type === 'wifi',
    isCellular: networkState.type === 'cellular'
  };
};