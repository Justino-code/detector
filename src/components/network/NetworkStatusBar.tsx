// src/components/NetworkStatusBar.tsx
import React from 'react';
import { Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetwork } from '../../hooks/useNetwork';
import { useTheme } from '../../hooks/useTheme';

const NetworkStatusBar: React.FC = () => {
  const { isOnline, isLoading } = useNetwork();
  const { currentTheme } = useTheme();
  
  // Animações separadas para entrada e saída
  const fadeInAnim = React.useRef(new Animated.Value(0)).current;
  const fadeOutAnim = React.useRef(new Animated.Value(0)).current;
  const [showReconnected, setShowReconnected] = React.useState(false);
  const [wasOffline, setWasOffline] = React.useState(false);

  React.useEffect(() => {
    if (!isLoading) {
      if (!isOnline) {
        // Entrando no estado offline
        setWasOffline(true);
        setShowReconnected(false);
        Animated.timing(fadeInAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (wasOffline) {
        // Voltando online - mostrar mensagem de reconexão
        setShowReconnected(true);
        Animated.timing(fadeOutAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start(() => {
          // Após animação, esconder tudo
          const timer = setTimeout(() => {
            setShowReconnected(false);
            setWasOffline(false);
            fadeInAnim.setValue(0);
            fadeOutAnim.setValue(0);
          }, 1500); // Mostrar por 1.5 segundos
          return () => clearTimeout(timer);
        });
      }
    }
  }, [isOnline, isLoading]);

  // Se está carregando ou online sem ter estado offline antes, não mostra nada
  if (isLoading || (!wasOffline && isOnline)) {
    return null;
  }

  // Mostrar mensagem de reconexão
  if (showReconnected) {
    return (
      <Animated.View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        opacity: fadeOutAnim,
        backgroundColor: currentTheme.colors.networkOnline 
      }}>
        <SafeAreaView edges={['top']} style={{
          paddingVertical: currentTheme.spacing.sm,
          paddingHorizontal: currentTheme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: currentTheme.typography.body2.fontSize,
            textAlign: 'center',
            color: 'white',
          }}>
            ✅ Conexão restaurada
          </Text>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // Mostrar mensagem de offline
  if (!isOnline && wasOffline) {
    return (
      <Animated.View style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        opacity: fadeInAnim,
        backgroundColor: currentTheme.colors.networkOffline 
      }}>
        <SafeAreaView edges={['top']} style={{
          paddingVertical: currentTheme.spacing.sm,
          paddingHorizontal: currentTheme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Text style={{
            fontWeight: 'bold',
            fontSize: currentTheme.typography.body2.fontSize,
            textAlign: 'center',
            color: 'white',
          }}>
            ⚠️ Sem conexão com a internet
          </Text>
          <Text style={{
            fontSize: currentTheme.typography.caption.fontSize,
            opacity: 0.9,
            textAlign: 'center',
            marginTop: currentTheme.spacing.xs,
            color: 'white',
          }}>
            Verifique sua conexão e tente novamente
          </Text>
        </SafeAreaView>
      </Animated.View>
    );
  }

  return null;
};

export default NetworkStatusBar;