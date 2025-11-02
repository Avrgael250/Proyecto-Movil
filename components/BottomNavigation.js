import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BottomNavigation({ activeScreen }) {
    const navigation = useNavigation();

    return (
        <View style={styles.bottomNav}>
            <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate('Home')}
            >
                <Ionicons 
                    name="home-outline" 
                    size={24} 
                    color={activeScreen === 'Home' ? '#4A8FE7' : '#030213'} 
                />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate('PresupuestosMensuales')}
            >
                <Ionicons 
                    name="wallet-outline" 
                    size={24} 
                    color={activeScreen === 'PresupuestosMensuales' ? '#4A8FE7' : '#030213'} 
                />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate('Calendario')}
            >
                <Ionicons 
                    name="calendar-outline" 
                    size={24} 
                    color={activeScreen === 'Calendario' ? '#4A8FE7' : '#030213'} 
                />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate('Transacciones')}
            >
                <Ionicons 
                    name="swap-horizontal-outline" 
                    size={24} 
                    color={activeScreen === 'Transacciones' ? '#4A8FE7' : '#030213'} 
                />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.navItem}
                onPress={() => navigation.navigate('Historial')}
            >
                <Ionicons 
                    name="time-outline" 
                    size={24} 
                    color={activeScreen === 'Historial' ? '#4A8FE7' : '#030213'} 
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingVertical: 12,
        paddingBottom: 20,
        borderTopWidth: 1,
        borderTopColor: '#d1d1d1',
    },
    navItem: {
        padding: 8,
    },
});