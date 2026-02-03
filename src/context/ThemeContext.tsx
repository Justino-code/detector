// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  error: string;
  errorLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  info: string;
  border: string;
  borderLight: string;
  overlay: string;
  shadow: string;
  networkOnline: string;
  networkOffline: string;
  networkWarning: string;
  disabled: string;
}

interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

interface ThemeTypography {
  h1: { fontSize: number; fontWeight: string };
  h2: { fontSize: number; fontWeight: string };
  h3: { fontSize: number; fontWeight: string };
  h4: { fontSize: number; fontWeight: string };
  body1: { fontSize: number; fontWeight: string };
  body2: { fontSize: number; fontWeight: string };
  caption: { fontSize: number; fontWeight: string };
}

interface AppTheme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    xlarge: number;
  };
  isDark: boolean;
}

interface ThemeContextType {
  themeMode: ThemeMode;
  currentTheme: AppTheme;
  toggleTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// TEMA CLARO MODERNO
const lightTheme: AppTheme = {
  colors: {
    primary: '#00B894',
    primaryLight: '#55EFC4',
    primaryDark: '#00A085',
    
    secondary: '#0984E3',
    secondaryLight: '#74B9FF',
    secondaryDark: '#0A79DF',
    
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F2F6',
    
    text: '#2D3436',
    textSecondary: '#636E72',
    textDisabled: '#B2BEC3',
    
    error: '#D63031',
    errorLight: '#FFEAA7',
    success: '#00B894',
    successLight: '#55EFC4',
    warning: '#FDCB6E',
    warningLight: '#FFF3C4',
    info: '#6C5CE7',
    
    border: '#DFE6E9',
    borderLight: '#F1F2F6',
    
    overlay: 'rgba(45, 52, 54, 0.5)',
    shadow: 'rgba(99, 110, 114, 0.15)',

    networkOnline: '#4CAF50',
    networkOffline: '#F44336',
    networkWarning: '#FF9800',

    disabled: '#E0E0E0',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  typography: {
    h1: { fontSize: 32, fontWeight: '800' },
    h2: { fontSize: 26, fontWeight: '700' },
    h3: { fontSize: 20, fontWeight: '600' },
    h4: { fontSize: 18, fontWeight: '600' },
    body1: { fontSize: 16, fontWeight: '400' },
    body2: { fontSize: 14, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '500' },
  },
  
  borderRadius: {
    small: 10,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  isDark: false,
};

// TEMA ESCURO MODERNO
const darkTheme: AppTheme = {
  colors: {
    primary: '#00D8A7',
    primaryLight: '#5CFFD6',
    primaryDark: '#00C095',
    
    secondary: '#1E90FF',
    secondaryLight: '#63B8FF',
    secondaryDark: '#1874CD',
    
    background: '#0F0F14',
    surface: '#1A1A23',
    surfaceVariant: '#252531',
    
    text: '#EAEAEA',
    textSecondary: '#B0B0C0',
    textDisabled: '#6A6A7A',
    
    error: '#FF6B6B',
    errorLight: '#2A1F1F',
    success: '#00D8A7',
    successLight: '#1A2A24',
    warning: '#FFD166',
    warningLight: '#2A271F',
    info: '#8884FF',
    
    border: '#2D2D3A',
    borderLight: '#3A3A47',
    
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',

    networkOnline: '#388E3C',
    networkOffline: '#D32F2F',
    networkWarning: '#F57C00',

    disabled: '#424242',
  },
  
  spacing: lightTheme.spacing,
  typography: lightTheme.typography,
  borderRadius: lightTheme.borderRadius,
  isDark: true,
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();

  console.log("Cor do sistema: "+systemColorScheme);

  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);
  const [currentSystemTheme, setCurrentSystemTheme] = useState<'light' | 'dark'>(
    systemColorScheme || 'light'
  );

  // 1. Monitorar mudanças no tema do sistema
  useEffect(() => {
    // Atualizar com o tema atual imediatamente
    const currentScheme = Appearance.getColorScheme();
    if (currentScheme && currentScheme !== currentSystemTheme) {
      setCurrentSystemTheme(currentScheme);
    }

    // Configurar listener para mudanças futuras
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme && colorScheme !== currentSystemTheme) {
        console.log('Sistema mudou tema para:', colorScheme);
        setCurrentSystemTheme(colorScheme);
      }
    });

    return () => subscription.remove();
  }, []);

  // 2. Carregar preferência do usuário
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@plant_detector_theme_mode');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto')) {
          console.log('Tema carregado do storage:', savedTheme);
          setThemeMode(savedTheme as ThemeMode);
        } else {
          console.log('Nenhum tema salvo, usando modo auto');
          setThemeMode('auto');
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
        setThemeMode('auto');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemePreference();
  }, []);

  // 3. Calcular o tema atual de forma otimizada
  const currentTheme = useMemo((): AppTheme => {
    let effectiveTheme: 'light' | 'dark';
    
    if (themeMode === 'auto') {
      // Seguir o tema do sistema
      effectiveTheme = currentSystemTheme === 'dark' ? 'dark' : 'light';
    } else {
      // Usar preferência do usuário
      effectiveTheme = themeMode;
    }
    
    console.log('Calculando tema:', {
      mode: themeMode,
      system: currentSystemTheme,
      effective: effectiveTheme
    });
    
    return effectiveTheme === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, currentSystemTheme]);

  // 4. Função para alterar tema
  const toggleTheme = async (mode: ThemeMode) => {
    console.log('Alterando tema para:', mode);
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem('@plant_detector_theme_mode', mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  if (isLoading) {
    return null;
  }

  const isDark = currentTheme.isDark;

  return (
    <ThemeContext.Provider value={{
      themeMode,
      currentTheme,
      toggleTheme,
      isDark,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  
  // Helper function para criar estilos
  const makeStyles = <T extends Record<string, any>>(
    stylesFn: (theme: AppTheme) => T
  ): T => {
    return stylesFn(context.currentTheme);
  };

  return {
    ...context,
    makeStyles,
  };
}
