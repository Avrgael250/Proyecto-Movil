import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importar las pantallas
import Home from '../screens/Inicio';
import PresupuestosMensuales from '../screens/PresupuestosMensuales';
import Calendario from '../screens/Calendario';
import Tarjetas from '../screens/Tarjetas';
import Historial from '../screens/Historial';
import ScreenDeTransacciones from '../screens/ScreenDeTransacciones';

const Tab = createBottomTabNavigator();

export default function Navigation() {
    return (
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
                        } else if (route.name === 'Tarjetas') {
                            iconName = focused ? 'card' : 'card-outline';
                        } else if (route.name === 'Historial') {
                            iconName = focused ? 'time' : 'time-outline';
                        } else if (route.name === 'Transacciones') {
                            iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
                        }

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: '#2196F3',
                    tabBarInactiveTintColor: 'gray',
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
                    options={{ tabBarLabel: 'Calendario' }}
                />
                <Tab.Screen 
                    name="Tarjetas" 
                    component={Tarjetas}
                    options={{ tabBarLabel: 'Tarjetas' }}
                />
                <Tab.Screen 
                    name="Historial" 
                    component={Historial}
                    options={{ tabBarLabel: 'Historial' }}
                />
                <Tab.Screen 
                    name="Transacciones" 
                    component={ScreenDeTransacciones}
                    options={{ tabBarLabel: 'Transacciones' }}
                />
            </Tab.Navigator>
        </NavigationContainer>
    );
}