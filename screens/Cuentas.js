import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';

export default function Cuentas() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [activeTab, setActiveTab] = useState('debito');

    useEffect(() => {
        const hideSystemBars = async () => {
            if (Platform.OS === 'android') {
                await StatusBar.setTranslucent(true);
                await NavigationBar.setVisibilityAsync('hidden');
                await NavigationBar.setBehaviorAsync('overlay');
                StatusBar.setHidden(true);
            } else {
                StatusBar.setHidden(true, 'fade');
            }
        };

        const showSystemBars = async () => {
            if (Platform.OS === 'android') {
                await StatusBar.setTranslucent(false);
                await NavigationBar.setVisibilityAsync('visible');
                StatusBar.setHidden(false);
            } else {
                StatusBar.setHidden(false, 'fade');
            }
        };

        if (isFocused) {
            hideSystemBars();
        }

        return () => {
            showSystemBars();
        };
    }, [isFocused]);

    const cuentasDebito = [
        {
            id: 1,
            title: 'Cheques',
            amount: 0.00,
            icon: 'card'
        },
        {
            id: 2,
            title: 'Efectivo',
            amount: 3100.00, // $5,000 presupuesto - $1,900 gastado
            icon: 'cash',
            budget: 5000.00,
            spent: 1900.00
        }
    ];

    const getBalanceTotal = () => {
        return cuentasDebito.reduce((total, cuenta) => total + cuenta.amount, 0).toFixed(2);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Cuentas</Text>
                <View style={styles.headerButtons}>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'debito' && styles.activeTab]}
                        onPress={() => setActiveTab('debito')}
                    >
                        <Text style={[styles.tabText, activeTab === 'debito' && styles.activeTabText]}>
                            Cuentas de débito
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tabButton, activeTab === 'credito' && styles.activeTab]}
                        onPress={() => setActiveTab('credito')}
                    >
                        <Text style={[styles.tabText, activeTab === 'credito' && styles.activeTabText]}>
                            Tarjetas de crédito
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView style={styles.accountsList}>
                {cuentasDebito.map((cuenta) => (
                    <TouchableOpacity key={cuenta.id} style={styles.accountItem}>
                        <View style={styles.accountLeft}>
                            <View style={styles.iconContainer}>
                                <Ionicons name={cuenta.icon} size={24} color="#1A1A1A" />
                            </View>
                            <View>
                                <Text style={styles.accountTitle}>{cuenta.title}</Text>
                                {cuenta.budget && (
                                    <Text style={styles.accountBudget}>
                                        Gastado ${cuenta.spent.toFixed(2)} de ${cuenta.budget.toFixed(2)}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <Text style={styles.accountAmount}>
                            {cuenta.amount >= 0 ? '$' : '-$'}{Math.abs(cuenta.amount).toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                ))}

                <View style={styles.balanceContainer}>
                    <Text style={styles.balanceLabel}>Balance Total</Text>
                    <Text style={styles.balanceAmount}>
                        {getBalanceTotal() >= 0 ? '$' : '-$'}{Math.abs(getBalanceTotal())}
                    </Text>
                </View>

                <TouchableOpacity style={styles.addAccountButton}>
                    <Text style={styles.addAccountText}>Agregar Cuenta</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.addButton}>
                <Ionicons name="add" size={28} color="#FFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFF',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 16,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#2196F3',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    activeTabText: {
        color: '#2196F3',
        fontWeight: '500',
    },
    accountsList: {
        flex: 1,
        backgroundColor: '#FFF',
        paddingHorizontal: 16,
    },
    accountItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    accountLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    accountTitle: {
        fontSize: 16,
        color: '#1A1A1A',
        marginBottom: 4,
    },
    accountBudget: {
        fontSize: 14,
        color: '#666',
    },
    accountAmount: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1A1A1A',
    },
    balanceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    balanceLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    balanceAmount: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    addAccountButton: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    addAccountText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 56,
        height: 56,
        borderRadius: 12,
        backgroundColor: '#4A8FE7',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 1,
    },
});