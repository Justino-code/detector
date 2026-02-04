// src/screens/HomeScreen/index.tsx
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../hooks/useTheme';
import ScreenContainer from '../../components/common/layout/ScreenContainer';
import HeroSection from '../../components/home/HeroSection';
import QuickActions from '../../components/home/QuickActionCard';
import RecentActivity from '../../components/home/RecentActivity';

const HomeScreen = ({ navigation }: any) => {
  const { makeStyles } = useTheme();
  
  const styles = makeStyles((theme) => ({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  }));

  // Handler para quando volta para a tela Home
  useFocusEffect(
    useCallback(() => {
      console.log('🏠 HomeScreen em foco');
      // A atualização agora é automática via useFocusEffect no RecentActivity
    }, [])
  );

  return (
    <ScreenContainer scrollable={true} contentPadding={true}>
      {/* Hero Section */}
      <HeroSection />

      {/* Quick Actions */}
      <QuickActions
        onStartAnalysis={() => navigation.navigate('Detection')}
        onViewHistory={() => navigation.navigate('History')}
      />

      {/* Atividade Recente - atualização automática via useFocusEffect */}
      <RecentActivity 
        onViewMore={() => navigation.navigate('History')}
      />

    </ScreenContainer>
  );
};

export default HomeScreen;