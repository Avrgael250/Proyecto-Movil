import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox, ActivityIndicator, View, StyleSheet, AppState } from 'react-native';
import { inicializarDB, verificarOCrearSesionPrueba } from './database/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

import AppNavigation from './navigation/AppNavigation';
import LockScreen from './screens/LockScreen';

LogBox.ignoreLogs([
  'Warning: Async Storage has been extracted from react-native core',
  'ViewPropTypes will be removed from React Native',
]);

export default function App() {
  const [dbInicializada, setDbInicializada] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [biometriaHabilitada, setBiometriaHabilitada] = useState(false);
  const [cargandoConfig, setCargandoConfig] = useState(true);

  useEffect(() => {
    const iniciar = async () => {
      // Inicializar DB
      const resultado = await inicializarDB();
      setDbInicializada(resultado);

      if (resultado) {
        await verificarOCrearSesionPrueba();
      }

      // Cargar preferencia de biometría
      try {
        const biometriaGuardada = await AsyncStorage.getItem('biometria_habilitada');
        const habilitada = biometriaGuardada === 'true';
        setBiometriaHabilitada(habilitada);

        // Si no está habilitada, considerar autenticado
        if (!habilitada) {
          setAutenticado(true);
        }
      } catch (error) {
        setAutenticado(true);
      }

      setCargandoConfig(false);
    };
    iniciar();
  }, []);

  // Bloquear cuando la app va a background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (biometriaHabilitada && (nextAppState === 'background' || nextAppState === 'inactive')) {
        setAutenticado(false);
      }
    });

    return () => {
      subscription?.remove();
    };
  }, [biometriaHabilitada]);

  // Pantalla de carga
  if (!dbInicializada || cargandoConfig) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A8FE7" />
      </View>
    );
  }

  // Pantalla de bloqueo si biometría está habilitada y no autenticado
  if (biometriaHabilitada && !autenticado) {
    return (
      <SafeAreaProvider>
        <LockScreen onUnlock={() => setAutenticado(true)} />
      </SafeAreaProvider>
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
