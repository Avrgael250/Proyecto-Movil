import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PresupuestosMensuales() {
    const mesActual = 'Sep';
    const anioActual = 2025;

    return (
    <SafeAreaView style={styles.container}>
      {/* Header Superior - Barra gris con título */}
        <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Presupuesto</Text>
        </View>

      {/* Header Principal - Mes y controles */}
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <Text style={styles.mesAnio}>{mesActual} {anioActual}</Text>
            </View>

            <View style={styles.headerRight}>
                <View style={styles.headerIcon}>
                    <Ionicons name="chevron-back" size={20} color="#030213" />
                </View>

                <View style={styles.headerIcon}>
                    <Ionicons name="chevron-forward" size={20} color="#030213" />
                </View>

            </View>
        </View>

      {/* Área de Contenido Principal */}
        <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
            {/* Estado vacío */}
        <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="receipt-outline" size={48} color="#4A8FE7" />
            </View>
            <Text style={styles.emptyText}>Sin entradas aún</Text>
        </View>
        </ScrollView>

      {/* Botón Flotante (FAB) */}
        <TouchableOpacity style={styles.fab}>
            <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>

      {/* Barra de Navegación Inferior */}
        <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="home" size={24} color="#4A8FE7" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="calendar" size={24} color="#4A8FE7" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="trending-up" size={24} color="#030213" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="card" size={24} color="#030213" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="trending-up" size={24} color="#030213" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="card" size={24} color="#030213" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navItem}>
                <Ionicons name="time" size={24} color="#030213" />
            </TouchableOpacity>

        </View>
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
  // Top Bar - Barra gris superior
    topBar: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#030213',
    },
  // Header Principal
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    headerLeft: {
        flex: 1,
    },
    mesAnio: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#030213',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    headerTextButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    headerText: {
        fontSize: 14,
        color: '#030213',
        fontWeight: '500',
    },
  // Área de Contenido
    contentArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    contentContainer: {
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 120,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        },
        emptyText: {
        fontSize: 16,
        color: '#717182',
        fontWeight: '400',
    },
  // Botón Flotante (FAB)
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 90,
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
    },
  // Barra de Navegación Inferior
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

