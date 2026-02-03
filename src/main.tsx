// src/main.tsx
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import MainTabNavigator from './navigation/MainTabNavigator';
import SplashScreen from './components/splash/SplashScreen';
import NetworkStatusBar from './components/network/NetworkStatusBar';

// Importar o serviço de rede
import { networkService } from './services/network';

// Componente principal
const AppContent = () => {
  const { currentTheme, isDark } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);

  useEffect(() => {
    // Inicializa o serviço de rede
    networkService.initialize();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      networkService.cleanup();
    };
  }, []);

  // Para o splash screen
  if (showSplash) {
    return (
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: '#F8F9FA'
      }}>
        <StatusBar 
          backgroundColor="#F8F9FA"
          barStyle="dark-content"
        />
        <SplashScreen />
      </SafeAreaView>
    );
  }

  // Para o app principal
  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: currentTheme.colors.background 
    }}>
      <StatusBar 
        backgroundColor={currentTheme.colors.background}
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      
      {/* NetworkStatusBar dentro do SafeAreaView */}
      <NetworkStatusBar />
      
      <NavigationContainer>
        <MainTabNavigator />
      </NavigationContainer>
    </SafeAreaView>
  );
};

// Container principal
export default function AppContainer() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}