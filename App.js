import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: Async Storage has been extracted from react-native core',
  'ViewPropTypes will be removed from React Native',
]);

// Importar las pantallas
import Home from './screens/Inicio';
import PresupuestosMensuales from './screens/PresupuestosMensuales';
import Calendario from './screens/GraficasScreen';
import TransaccionesScreen from './screens/ElementoDeTransaccionScreen';
import Historial from './screens/Historial';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'PresupuestosMensuales') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Calendario') {
                iconName = focused ? 'calendar' : 'calendar-outline';
              } else if (route.name === 'Transacciones') {
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              } else if (route.name === 'Historial') {
                iconName = focused ? 'time' : 'time-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#4A8FE7',
            tabBarInactiveTintColor: '#030213',
            tabBarStyle: {
              backgroundColor: '#E3F2FD',
              borderTopWidth: 1,
              borderTopColor: '#d1d1d1',
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
          })}
        >
          <Tab.Screen 
            name="Home" 
            component={Home}
            options={{ tabBarLabel: 'Inicio' }}
          />
          <Tab.Screen 
            name="PresupuestosMensuales" 
            component={PresupuestosMensuales}
            options={{ tabBarLabel: 'Presupuestos' }}
          />
          <Tab.Screen 
            name="Calendario" 
            component={Calendario}
            options={{ tabBarLabel: 'Graficas' }}
          />
          <Tab.Screen 
            name="Transacciones" 
            component={TransaccionesScreen}
            options={{ tabBarLabel: 'Transacciones' }}
          />
          <Tab.Screen 
            name="Historial" 
            component={Historial}
            options={{ tabBarLabel: 'Historial' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}