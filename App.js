import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Importar las pantallas
import Home from './screens/Inicio';
import PresupuestosMensuales from './screens/PresupuestosMensuales';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FFFFFF' }
          }}
        >
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="PresupuestosMensuales" component={PresupuestosMensuales} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}