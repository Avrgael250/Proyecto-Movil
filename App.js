import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, ActivityIndicator, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { inicializarDB, verificarOCrearSesionPrueba } from './database/database';

import AppNavigation from './navigation/AppNavigation';

LogBox.ignoreLogs([
  'Warning: Async Storage has been extracted from react-native core',
  'ViewPropTypes will be removed from React Native',
]);

export default function App() {
  const [dbInicializada, setDbInicializada] = useState(false);

  useEffect(() => {
    const iniciar = async () => {
      const resultado = await inicializarDB();
      setDbInicializada(resultado);

      if (resultado) {
        console.log('🔍 Verificando sesión de prueba...');
        await verificarOCrearSesionPrueba();
      }
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
