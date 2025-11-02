import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';

// Importar las pantallas
import Home from '../screens/Inicio';
import PresupuestosMensuales from '../screens/PresupuestosMensuales';
import Calendario from '../screens/Calendario';
import Tarjetas from '../screens/Tarjetas';
import Historial from '../screens/Historial';

const Stack = createStackNavigator();

export default function Navigation() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#FFFFFF' }
                }}
            >
                <Stack.Screen name="Home" component={Home} />
                <Stack.Screen name="PresupuestosMensuales" component={PresupuestosMensuales} />
                <Stack.Screen name="Calendario" component={Calendario} />
                <Stack.Screen name="Tarjetas" component={Tarjetas} />
                <Stack.Screen name="Historial" component={Historial} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}