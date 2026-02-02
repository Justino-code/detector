// src/screens/SettingsScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Alert,
  ScrollView,
  StyleSheet,
  Linking,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme, ThemeMode } from '../../hooks/useTheme';
import ScreenContainer from '../../components/common/layout/ScreenContainer';
import SettingsGroup from '../../components/settings/SettingsGroup';
import ThemeSelector from '../../components/settings/ThemeSelector';
import AboutSection from '../../components/settings/AboutSection';
import Button from '../../components/common/buttons/Button';
import Typography from '../../components/common/typography/Typography';
import  DetectionService  from '../../services/DetectionService';

import { clearHistory } from '../../services/historyStorageService';

import { APP_INFO } from '../../config/env';

const APP_VERSION = APP_INFO.APP_VERSION;

const SettingsScreen = () => {
  const { themeMode, toggleTheme, currentTheme } = useTheme();
  const [appVersion] = useState(APP_VERSION);
  const [simulationMode, setSimulationMode] = useState(false);
  const [preprocessingEnabled, setPreprocessingEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Carregar configurações salvas
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSimulation = await AsyncStorage.getItem('@app_simulation_mode');
        const savedPreprocessing = await AsyncStorage.getItem('@app_preprocessing_mode');
        
        if (savedSimulation !== null) {
          const simulation = savedSimulation === 'true';
          setSimulationMode(simulation);
          DetectionService.setSimulationMode(simulation);
        }
        
        if (savedPreprocessing !== null) {
          const preprocessing = savedPreprocessing === 'true';
          setPreprocessingEnabled(preprocessing);
          DetectionService.setPreprocessingMode(preprocessing);
        }
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Salvar configuração de modo simulado
  const handleToggleSimulation = useCallback(async (value: boolean) => {
    try {
      setLoading(true);
      setSimulationMode(value);
      DetectionService.setSimulationMode(value);
      await AsyncStorage.setItem('@app_simulation_mode', value.toString());
      
      Alert.alert(
        value ? 'Modo Simulado Ativado' : 'Modo Simulado Desativado',
        value 
          ? 'O app usará dados simulados para análise. Ideal para desenvolvimento e testes.'
          : 'O app usará a API real para análises. Modo de produção.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Salvar configuração de pré-processamento
  const handleTogglePreprocessing = useCallback(async (value: boolean) => {
    try {
      setLoading(true);
      setPreprocessingEnabled(value);
      DetectionService.setPreprocessingMode(value);
      await AsyncStorage.setItem('@app_preprocessing_mode', value.toString());
      
      Alert.alert(
        value ? 'Pré-processamento Ativado' : 'Pré-processamento Desativado',
        value 
          ? 'Imagens serão otimizadas antes da análise (recomendado).'
          : 'Imagens serão enviadas sem otimização (apenas para testes).',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearCache = useCallback(async () => {
    Alert.alert(
      'Limpar Cache',
      'Tem certeza que deseja limpar todos os dados em cache? Isso removerá análises salvas e configurações.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              // Limpar dados do usuário
              await clearHistory();
              
              Alert.alert('Sucesso', 'Cache limpo com sucesso!');
            } catch (error) {
              console.error('Erro ao limpar cache:', error);
              Alert.alert('Erro', 'Não foi possível limpar o cache.');
            }
          },
        },
      ]
    );
  }, []);

  const handleResetSettings = useCallback(async () => {
    Alert.alert(
      'Redefinir Configurações',
      'Todas as configurações serão restauradas para os valores padrão.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Redefinir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Restaurar valores padrão
              const defaultSimulation = false;
              const defaultPreprocessing = true;
              
              setSimulationMode(defaultSimulation);
              setPreprocessingEnabled(defaultPreprocessing);
              DetectionService.setSimulationMode(defaultSimulation);
              DetectionService.setPreprocessingMode(defaultPreprocessing);
              
              await AsyncStorage.setItem('@app_simulation_mode', defaultSimulation.toString());
              await AsyncStorage.setItem('@app_preprocessing_mode', defaultPreprocessing.toString());
              
              Alert.alert('Sucesso', 'Configurações redefinidas para padrão!');
            } catch (error) {
              console.error('Erro ao redefinir configurações:', error);
              Alert.alert('Erro', 'Não foi possível redefinir as configurações.');
            }
          },
        },
      ]
    );
  }, []);

  const handleSendFeedback = useCallback(() => {
    const email = 'suporte@detectorpragas.com';
    const subject = 'Feedback - Detector de Pragas';
    const body = `\n\n---\nInformações do app:\nVersão: ${appVersion}\nModo Simulado: ${simulationMode ? 'Ativado' : 'Desativado'}\nPré-processamento: ${preprocessingEnabled ? 'Ativado' : 'Desativado'}`;
    
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível abrir o cliente de email.');
      });
  }, [appVersion, simulationMode, preprocessingEnabled]);

  const handleRateApp = useCallback(() => {
    // Em produção, link para app store
    Alert.alert(
      'Avaliar App',
      'Em produção, isso abriria a loja de aplicativos.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleShareApp = useCallback(() => {
    Alert.alert(
      'Compartilhar App',
      'Em produção, isso permitiria compartilhar o app com amigos.',
      [{ text: 'OK' }]
    );
  }, []);

  const handleOpenDebugInfo = useCallback(() => {
    Alert.alert(
      'Informações de Debug',
      `Versão: ${appVersion}\nModo Simulado: ${simulationMode ? 'Ativado' : 'Desativado'}\nPré-processamento: ${preprocessingEnabled ? 'Ativado' : 'Desativado'}\nTema: ${themeMode}`,
      [{ text: 'OK' }]
    );
  }, [appVersion, simulationMode, preprocessingEnabled, themeMode]);

  return (
    <ScreenContainer
      headerTitle="Configurações"
      scrollable={false}
    >
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: currentTheme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção: Aparência */}
        <SettingsGroup title="Aparência">
          <ThemeSelector
            currentThemeMode={themeMode}
            onThemeChange={toggleTheme}
          />
        </SettingsGroup>

        {/* Seção: Análise */}
        <SettingsGroup title="Configurações de Análise">
          <View style={{ gap: currentTheme.spacing.md }}>
            {/* Modo Simulado */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Typography variant="body1" style={{ fontWeight: '600' }}>
                  Modo Simulado
                </Typography>
                <Typography variant="caption" style={{ color: currentTheme.colors.textSecondary }}>
                  {simulationMode 
                    ? 'Usando dados simulados para testes' 
                    : 'Usando API real para análises'}
                </Typography>
              </View>
              <Switch
                value={simulationMode}
                onValueChange={handleToggleSimulation}
                disabled={loading}
                trackColor={{ 
                  false: currentTheme.colors.border, 
                  true: currentTheme.colors.primary 
                }}
                thumbColor={simulationMode ? currentTheme.colors.primaryLight : '#f4f3f4'}
              />
            </View>

            {/* Pré-processamento */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Typography variant="body1" style={{ fontWeight: '600' }}>
                  Pré-processamento de Imagens
                </Typography>
                <Typography variant="caption" style={{ color: currentTheme.colors.textSecondary }}>
                  {preprocessingEnabled 
                    ? 'Imagens otimizadas antes do envio (recomendado)' 
                    : 'Envia imagens sem otimização'}
                </Typography>
              </View>
              <Switch
                value={preprocessingEnabled}
                onValueChange={handleTogglePreprocessing}
                disabled={loading}
                trackColor={{ 
                  false: currentTheme.colors.border, 
                  true: currentTheme.colors.primary 
                }}
                thumbColor={preprocessingEnabled ? currentTheme.colors.primaryLight : '#f4f3f4'}
              />
            </View>
          </View>
        </SettingsGroup>

        {/* Seção: Dados */}
        <SettingsGroup title="Dados e Armazenamento">
          <View style={{ gap: currentTheme.spacing.sm }}>
            <Button
              variant="outline"
              title="Limpar Cache"
              iconLeft="delete"
              onPress={handleClearCache}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
            
            <Button
              variant="outline"
              title="Redefinir Configurações"
              iconLeft="restore"
              onPress={handleResetSettings}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
            
            <Button
              variant="outline"
              title="Exportar Dados"
              iconLeft="export"
              onPress={() => Alert.alert('Em desenvolvimento', 'Funcionalidade em desenvolvimento.')}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
          </View>
        </SettingsGroup>

        {/* Seção: Debug (apenas em desenvolvimento) */}
        {__DEV__ && (
          <SettingsGroup title="Desenvolvimento">
            <View style={{ gap: currentTheme.spacing.sm }}>
              <Button
                variant="outline"
                title="Informações de Debug"
                iconLeft="bug"
                onPress={handleOpenDebugInfo}
                style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
              />
              
              <Typography variant="caption" style={{ 
                color: currentTheme.colors.textSecondary, 
                textAlign: 'center',
                marginTop: currentTheme.spacing.xs
              }}>
                Esta seção só aparece em desenvolvimento
              </Typography>
            </View>
          </SettingsGroup>
        )}

        {/* Seção: Suporte */}
        <SettingsGroup title="Suporte">
          <View style={{ gap: currentTheme.spacing.sm }}>
            <Button
              variant="outline"
              title="Enviar Feedback"
              iconLeft="email"
              onPress={handleSendFeedback}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
            
            <Button
              variant="outline"
              title="Avaliar App"
              iconLeft="star"
              onPress={handleRateApp}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
            
            <Button
              variant="outline"
              title="Compartilhar App"
              iconLeft="share-variant"
              onPress={handleShareApp}
              style={{ backgroundColor: currentTheme.colors.surfaceVariant }}
            />
          </View>
        </SettingsGroup>

        {/* Seção: Sobre */}
        <AboutSection version={appVersion} />

        {/* Indicadores de estado */}
        <View style={[styles.statusIndicators, { 
          backgroundColor: currentTheme.colors.surfaceVariant,
          borderColor: currentTheme.colors.border 
        }]}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { 
              backgroundColor: simulationMode ? currentTheme.colors.warning : currentTheme.colors.success 
            }]} />
            <Typography variant="caption">
              Modo: {simulationMode ? 'Simulação' : 'Produção'}
            </Typography>
          </View>
          
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { 
              backgroundColor: preprocessingEnabled ? currentTheme.colors.success : currentTheme.colors.textDisabled 
            }]} />
            <Typography variant="caption">
              Pré-processamento: {preprocessingEnabled ? 'Ativo' : 'Inativo'}
            </Typography>
          </View>
        </View>

        {/* Rodapé */}
        <View style={{ 
          marginTop: currentTheme.spacing.xl, 
          paddingTop: currentTheme.spacing.lg,
          borderTopWidth: 1,
          borderTopColor: currentTheme.colors.border,
          alignItems: 'center'
        }}>
          <Typography variant="caption" style={{ color: currentTheme.colors.textSecondary, textAlign: 'center' }}>
            🌱 Detector de Pragas v{appVersion}
          </Typography>
          <Typography variant="caption" style={{ 
            color: currentTheme.colors.textSecondary, 
            textAlign: 'center',
            marginTop: currentTheme.spacing.xs
          }}>
            Identificação inteligente de doenças em plantas
          </Typography>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  statusIndicators: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default SettingsScreen;