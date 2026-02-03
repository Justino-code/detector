import NetInfo from '@react-native-community/netinfo';

class NetworkService {
  constructor() {
    this.subscribers = new Set();
    this.currentState = null;
    this.unsubscribe = null;
  }

  /**
   * Inicializa o monitoramento de rede
   */
  initialize() {
    // Obtém o estado inicial
    NetInfo.fetch().then(state => {
      this.currentState = state;
    });

    // Escuta mudanças de conexão
    this.unsubscribe = NetInfo.addEventListener(state => {
      this.currentState = state;
      this.notifySubscribers(state);
    });

    return this;
  }

  /**
   * Inscreve um componente para receber atualizações
   * @param {Function} callback - Função chamada quando há mudança na conexão
   * @returns {Function} Função para cancelar inscrição
   */
  subscribe(callback: Function): Function {
    this.subscribers.add(callback);
    
    // Envia o estado atual imediatamente
    if (this.currentState) {
      callback(this.currentState);
    }

    // Retorna função para cancelar inscrição
    return () => this.subscribers.delete(callback);
  }

  /**
   * Notifica todos os inscritos sobre mudanças
   * @param {Object} state - Estado da conexão
   */
  notifySubscribers(state: object) {
    this.subscribers.forEach(callback => {
      try {
        callback(state);
      } catch (error) {
        console.error('Erro ao notificar inscrito:', error);
      }
    });
  }

  /**
   * Verifica o estado atual da conexão
   * @returns {Promise<Object>} Estado da conexão
   */
  async checkConnection(): Promise<object> {
    return await NetInfo.fetch();
  }

  /**
   * Verifica se está conectado à internet
   * @returns {Promise<boolean>}
   */
  async isConnected(): Promise<boolean> {
    const state = await this.checkConnection();
    return state.isConnected;
  }

  /**
   * Verifica se a internet está acessível
   * @returns {Promise<boolean>}
   */
  async isInternetReachable(): Promise<boolean> {
    const state = await this.checkConnection();
    return state.isInternetReachable;
  }

  /**
   * Obtém o tipo de conexão
   * @returns {Promise<string>}
   */
  async getConnectionType(): Promise<string> {
    const state = await this.checkConnection();
    return state.type;
  }

  /**
   * Obtém detalhes da conexão (wifi/celular)
   * @returns {Promise<Object>}
   */
  async getConnectionDetails(): Promise<object> {
    const state = await this.checkConnection();
    return state.details;
  }

  /**
   * Verifica se está conectado via WiFi
   * @returns {Promise<boolean>}
   */
  async isWiFi(): Promise<boolean> {
    const state = await this.checkConnection();
    return state.type === 'wifi';
  }

  /**
   * Verifica se está conectado via dados móveis
   * @returns {Promise<boolean>}
   */
  async isCellular(): Promise<boolean> {
    const state = await this.checkConnection();
    return state.type === 'cellular';
  }

  /**
   * Verifica se está desconectado
   * @returns {Promise<boolean>}
   */
  async isOffline(): Promise<boolean> {
    const state = await this.checkConnection();
    return !state.isConnected;
  }

  /**
   * Aguarda até que uma conexão esteja disponível
   * @param {number} timeout - Timeout em milissegundos (opcional)
   * @returns {Promise<boolean>}
   */
  waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const checkInterval = 1000; // Verifica a cada segundo

      const checkConnection = async () => {
        try {
          const isConnected = await this.isConnected();
          
          if (isConnected) {
            resolve(true);
            return;
          }

          // Verifica timeout
          if (Date.now() - startTime > timeout) {
            reject(new Error('Timeout aguardando conexão'));
            return;
          }

          // Agenda próxima verificação
          setTimeout(checkConnection, checkInterval);
        } catch (error) {
          reject(error);
        }
      };

      checkConnection();
    });
  }

  /**
   * Limpa todos os recursos
   */
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.subscribers.clear();
  }
}

// Singleton para uso em toda a aplicação
export const networkService = new NetworkService();
//export default networkService;