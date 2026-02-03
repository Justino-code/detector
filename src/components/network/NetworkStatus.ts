import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../../hooks/useNetwork';

const NetworkStatus = () => {
  const { isOnline, type, isLoading } = useNetwork();

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loading]}>
        <Text style={styles.text}>Verificando conexão...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isOnline ? styles.online : styles.offline]}>
      <Text style={styles.text}>
        {isOnline ? `Conectado (${type})` : 'Sem conexão'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#F44336',
  },
  loading: {
    backgroundColor: '#FF9800',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default NetworkStatus;