import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';

export default function PresupuestosMensuales() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const mesActual = 'Nov';
    const anioActual = 2025;

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
    const [modalVisible, setModalVisible] = useState(false);

    return (
    <View style={styles.container}>
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
            {/* Círculo de progreso y monto restante */}
            <View style={styles.budgetSummary}>
                <View style={styles.progressRing}>
                    <Text style={styles.percentageText}>38%</Text>
                </View>
                <View style={styles.remainingAmount}>
                    <Text style={styles.remainingLabel}>Restante</Text>
                    <Text style={styles.remainingValue}>$3,100.00</Text>
                    <Text style={styles.spentText}>Gastado $1,900 de <Text style={styles.totalBudget}>$5,000</Text></Text>
                </View>
            </View>

            {/* Categorías de presupuesto */}
            <View style={styles.categories}>
                <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={[styles.categoryIcon, { backgroundColor: '#E3F2FD' }]}>
                        <Ionicons name="cart" size={24} color="#2196F3" />
                    </View>
                    <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryName}>Supermercado</Text>
                            <Text style={styles.categoryAmount}>$850</Text>
                        </View>
                        <View style={styles.categoryProgress}>
                            <View style={[styles.progressBar, { backgroundColor: '#2196F3', width: '42.5%' }]} />
                        </View>
                        <Text style={styles.transactionCount}>4 transacciones</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={[styles.categoryIcon, { backgroundColor: '#FFF3E0' }]}>
                        <Ionicons name="car" size={24} color="#FF9800" />
                    </View>
                    <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryName}>Transporte</Text>
                            <Text style={styles.categoryAmount}>$600</Text>
                        </View>
                        <View style={styles.categoryProgress}>
                            <View style={[styles.progressBar, { backgroundColor: '#FF9800', width: '30%' }]} />
                        </View>
                        <Text style={styles.transactionCount}>8 transacciones</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.categoryItem}
                    onPress={() => setModalVisible(true)}
                >
                    <View style={[styles.categoryIcon, { backgroundColor: '#F3E5F5' }]}>
                        <Ionicons name="phone-portrait" size={24} color="#9C27B0" />
                    </View>
                    <View style={styles.categoryInfo}>
                        <View style={styles.categoryHeader}>
                            <Text style={styles.categoryName}>Servicios</Text>
                            <Text style={styles.categoryAmount}>$450</Text>
                        </View>
                        <View style={styles.categoryProgress}>
                            <View style={[styles.progressBar, { backgroundColor: '#9C27B0', width: '22.5%' }]} />
                        </View>
                        <Text style={styles.transactionCount}>3 transacciones</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Modal de Editar Gasto */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            style={styles.backButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Ionicons name="chevron-back" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Editar Gasto</Text>
                        <TouchableOpacity>
                            <Ionicons name="trash-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        <Text style={styles.modalLabel}>Monto</Text>
                        <Text style={styles.modalMonto}>$300.00</Text>
                        <View style={styles.pagadoContainer}>
                            <Ionicons name="checkmark" size={20} color="#4CAF50" />
                            <Text style={styles.pagadoText}>PAGADO</Text>
                        </View>

                        <Text style={styles.modalLabel}>Descripción</Text>
                        <Text style={styles.modalValue}>Sí</Text>

                        <Text style={styles.modalLabel}>Fecha de Transacción</Text>
                        <Text style={styles.modalValue}>2 nov 2025</Text>

                        <Text style={styles.modalLabel}>Fecha de pago</Text>
                        <Text style={styles.modalValue}>2 nov 2025</Text>

                        <Text style={styles.modalLabel}>Cuenta</Text>
                        <Text style={styles.modalValue}>Efectivo</Text>

                        <Text style={styles.modalLabel}>Categoría</Text>
                        <Text style={styles.modalValue}>Familia</Text>

                        <Text style={styles.modalLabel}>Notas</Text>
                        <View style={styles.notasContainer} />

                        <TouchableOpacity style={styles.deshacerButton}>
                            <Text style={styles.deshacerText}>Deshacer Pago</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>
        </ScrollView>

      {/* Botón Flotante (FAB) */}
        <TouchableOpacity style={styles.fab}>
            <Ionicons name="add" size={28} color="#ffffff" />
        </TouchableOpacity>

    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: 0,
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
    budgetSummary: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    progressRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 12,
        borderColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    percentageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#030213',
    },
    remainingAmount: {
        flex: 1,
    },
    remainingLabel: {
        fontSize: 16,
        color: '#717182',
        marginBottom: 4,
    },
    remainingValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 4,
    },
    spentText: {
        fontSize: 14,
        color: '#717182',
    },
    totalBudget: {
        color: '#4A8FE7',
    },
    categories: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#030213',
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#030213',
    },
    categoryProgress: {
        height: 4,
        backgroundColor: '#E3F2FD',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    transactionCount: {
        fontSize: 12,
        color: '#717182',
    },
  // Botón Flotante (FAB)
    fab: {
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
    // Estilos del Modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    backButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalLabel: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    modalMonto: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    pagadoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    pagadoText: {
        color: '#4CAF50',
        marginLeft: 4,
        fontWeight: '500',
    },
    modalValue: {
        fontSize: 16,
        color: '#000',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    notasContainer: {
        height: 100,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginTop: 8,
    },
    deshacerButton: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 32,
    },
    deshacerText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: '600',
    },
});

