import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { inicializarDB } from './database/database';

import AppNavigation from './navigation/AppNavigation';

export default function App() {
  const [dbInicializada, setDbInicializada] = useState(false);

  useEffect(() => {
    const iniciar = async () => {
      const resultado = await inicializarDB();
      setDbInicializada(resultado);
    };
    iniciar();
  }, []);

  if (!dbInicializada) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A8FE7" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigation />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },
});
