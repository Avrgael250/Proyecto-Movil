import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LogBox } from 'react-native';

// Ignorar advertencias específicas
LogBox.ignoreLogs([
  'Warning: Async Storage has been extracted from react-native core',
  'ViewPropTypes will be removed from React Native',
]);

// Importar las pantallas
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import Home from './screens/Inicio';
import PresupuestosMensuales from './screens/PresupuestosMensuales';
import Graficas from './screens/GraficasScreen';
import TransaccionesScreen from './screens/ElementoDeTransaccionScreen';
import Cuentas from './screens/Cuentas';
import Calendario from './screens/Calendario';

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
                iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              } else if (route.name === 'Graficas') {
                iconName = focused ? 'pie-chart' : 'pie-chart-outline';
              } else if (route.name === 'Transacciones') {
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              } else if (route.name === 'Historial') {
                iconName = focused ? 'time' : 'time-outline';
              } else if (route.name === 'Login') {
                iconName = focused ? 'log-in' : 'log-in-outline';
              } else if (route.name === 'Register') {
                iconName = focused ? 'person-add' : 'person-add-outline';
              } else if (route.name === 'Cuentas') {
                iconName = focused ? 'wallet' : 'wallet-outline';
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
            name="Register" 
            component={RegisterScreen}
            options={{ tabBarLabel: 'Registro' }}
          />
          <Tab.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ tabBarLabel: 'Login' }}
          />
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
            name="Graficas" 
            component={Graficas}
            options={{ tabBarLabel: 'Gráficas' }}
          />
          <Tab.Screen 
            name="Transacciones" 
            component={TransaccionesScreen}
            options={{ tabBarLabel: 'Transacciones' }}
          />
          <Tab.Screen 
            name="Cuentas" 
            component={Cuentas}
            options={{ tabBarLabel: 'Cuentas' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}


