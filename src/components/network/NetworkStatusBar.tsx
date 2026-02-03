// src/components/NetworkStatusBar.tsx
import React from 'react';
import { Text, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetwork } from '../../hooks/useNetwork';
import { useTheme } from '../../hooks/useTheme';

const NetworkStatusBar: React.FC = () => {
  const { isOnline, isLoading } = useNetwork();
  const { currentTheme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (!isLoading) {
      Animated.timing(fadeAnim, {
        toValue: isOnline ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, isLoading, fadeAnim]);

  if (isLoading || isOnline) {
    return null;
  }

  return (
    <Animated.View style={{ 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      opacity: fadeAnim,
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
};

export default NetworkStatusBar;