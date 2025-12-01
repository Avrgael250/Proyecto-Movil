import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecuperarContrasenaScreen from '../screens/RecuperarContrasenaScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ConfiguracionScreen from '../screens/ConfiguracionScreen';

import Home from '../screens/Inicio';
import PresupuestosMensuales from '../screens/PresupuestosMensuales';
import Tarjetas from '../screens/GraficasScreen';
import Cuentas from '../screens/Cuentas';
import ScreenDeTransacciones from '../screens/ScreenDeTransacciones';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let icon;

          if (route.name === 'Inicio') icon = 'home-outline';
          if (route.name === 'Presupuesto') icon = 'calendar-outline';
          if (route.name === 'Gráficas') icon = 'pie-chart-outline';
          if (route.name === 'Cuentas') icon = 'wallet-outline';
          if (route.name === 'Transacciones') icon = 'swap-horizontal-outline';

          return <Ionicons name={icon} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Inicio" component={Home} />
      <Tab.Screen name="Presupuesto" component={PresupuestosMensuales} />
      <Tab.Screen name="Gráficas" component={Tarjetas} />
      <Tab.Screen name="Cuentas" component={Cuentas} />
      <Tab.Screen name="Transacciones" component={ScreenDeTransacciones} />
    </Tab.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasenaScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />
        <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
