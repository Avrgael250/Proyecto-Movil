import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import BotonAgregarTransaccion from '../components/BotonAgregarTransaccion';
import {
    obtenerCuentasUsuario,
    guardarCuenta,
    actualizarCuenta,
    eliminarCuenta,
    obtenerSesion
} from '../database/database';

const ICONOS_DISPONIBLES = [
    { nombre: 'wallet', label: 'Cartera' },
    { nombre: 'card', label: 'Tarjeta' },
    { nombre: 'cash', label: 'Efectivo' },
    { nombre: 'briefcase', label: 'Maletín' },
    { nombre: 'home', label: 'Casa' },
    { nombre: 'school', label: 'Escuela' },
    { nombre: 'business', label: 'Negocio' },
    { nombre: 'gift', label: 'Regalo' },
];

export default function Cuentas() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();
    const [activeTab, setActiveTab] = useState('debito');
    const [cuentas, setCuentas] = useState([]);
    const [usuarioEmail, setUsuarioEmail] = useState('');

    // Estados para el modal de agregar/editar cuenta
    const [modalVisible, setModalVisible] = useState(false);
    const [modalIconos, setModalIconos] = useState(false);
    const [editando, setEditando] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);

    // Campos del formulario
    const [nombreCuenta, setNombreCuenta] = useState('');
    const [saldoCuenta, setSaldoCuenta] = useState('');
    const [iconoSeleccionado, setIconoSeleccionado] = useState('wallet');
    const [presupuestoCuenta, setPresupuestoCuenta] = useState('');
    const [gastadoCuenta, setGastadoCuenta] = useState('');

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
            cargarDatos();
        }

        return () => {
            showSystemBars();
        };
    }, [isFocused]);

    const cargarDatos = async () => {
        try {
            console.log('🔄 Cargando datos de cuentas...');
            const sesion = await obtenerSesion();
            console.log('📧 Sesión en Cuentas:', sesion);
            if (sesion && sesion.usuario_email) {
                setUsuarioEmail(sesion.usuario_email);
                const cuentasDb = await obtenerCuentasUsuario(sesion.usuario_email);
                console.log('💳 Cuentas obtenidas:', cuentasDb);
                console.log('📊 Total de cuentas:', cuentasDb.length);
                setCuentas(cuentasDb);
            } else {
                console.log('⚠️ No hay sesión activa en Cuentas');
            }
        } catch (error) {
            console.error('❌ Error al cargar datos:', error);
            Alert.alert('Error', 'No se pudieron cargar las cuentas: ' + error.message);
        }
    };

    const cuentasFiltradas = cuentas.filter(cuenta => cuenta.tipo === activeTab);

    const getBalanceTotal = () => {
        return cuentasFiltradas.reduce((total, cuenta) => total + (cuenta.saldo || 0), 0).toFixed(2);
    };

    const abrirModalAgregar = () => {
        resetearFormulario();
        setEditando(false);
        setModalVisible(true);
    };

    const abrirModalEditar = (cuenta) => {
        setCuentaSeleccionada(cuenta);
        setNombreCuenta(cuenta.nombre);
        setSaldoCuenta(cuenta.saldo.toString());
        setIconoSeleccionado(cuenta.icono);
        setPresupuestoCuenta(cuenta.presupuesto ? cuenta.presupuesto.toString() : '');
        setGastadoCuenta(cuenta.gastado ? cuenta.gastado.toString() : '');
        setEditando(true);
        setModalVisible(true);
    };

    const resetearFormulario = () => {
        setNombreCuenta('');
        setSaldoCuenta('');
        setIconoSeleccionado('wallet');
        setPresupuestoCuenta('');
        setGastadoCuenta('');
        setCuentaSeleccionada(null);
    };

    const guardarCuentaNueva = async () => {
        if (!nombreCuenta.trim()) {
            Alert.alert('Error', 'Ingresa un nombre para la cuenta');
            return;
        }

        if (!usuarioEmail) {
            Alert.alert('Error', 'No hay sesión activa. Por favor inicia sesión.');
            return;
        }

        const nuevaCuenta = {
            nombre: nombreCuenta,
            tipo: activeTab,
            saldo: parseFloat(saldoCuenta) || 0,
            icono: iconoSeleccionado,
            presupuesto: parseFloat(presupuestoCuenta) || 0,
            gastado: parseFloat(gastadoCuenta) || 0,
        };

        console.log('💾 Guardando cuenta:', nuevaCuenta);
        console.log('👤 Usuario:', usuarioEmail);

        try {
            if (editando && cuentaSeleccionada) {
                const resultado = await actualizarCuenta(cuentaSeleccionada.id, nuevaCuenta);
                console.log('✅ Resultado actualización:', resultado);
                Alert.alert('Éxito', 'Cuenta actualizada correctamente');
            } else {
                const resultado = await guardarCuenta(nuevaCuenta, usuarioEmail);
                console.log('✅ Resultado guardado:', resultado);
                Alert.alert('Éxito', 'Cuenta guardada correctamente');
            }
            setModalVisible(false);
            await cargarDatos();
        } catch (error) {
            console.error('❌ Error al guardar cuenta:', error);
            Alert.alert('Error', 'No se pudo guardar la cuenta: ' + error.message);
        }
    };

    const confirmarEliminar = (cuenta) => {
        Alert.alert(
            'Eliminar cuenta',
            `¿Estás seguro de que deseas eliminar "${cuenta.nombre}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => eliminarCuentaSeleccionada(cuenta.id)
                }
            ]
        );
    };

    const eliminarCuentaSeleccionada = async (id) => {
        try {
            await eliminarCuenta(id);
            Alert.alert('Éxito', 'Cuenta eliminada correctamente');
            cargarDatos();
        } catch (error) {
            console.error('Error al eliminar cuenta:', error);
            Alert.alert('Error', 'No se pudo eliminar la cuenta');
        }
    };

    const seleccionarIcono = (icono) => {
        setIconoSeleccionado(icono);
        setModalIconos(false);
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
                {cuentasFiltradas.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="wallet-outline" size={64} color="#CCC" />
                        <Text style={styles.emptyText}>No hay cuentas registradas</Text>
                        <Text style={styles.emptySubtext}>Toca "Agregar Cuenta" para comenzar</Text>
                    </View>
                ) : (
                    cuentasFiltradas.map((cuenta) => (
                        <TouchableOpacity
                            key={cuenta.id}
                            style={styles.accountItem}
                            onPress={() => abrirModalEditar(cuenta)}
                            onLongPress={() => confirmarEliminar(cuenta)}
                        >
                            <View style={styles.accountLeft}>
                                <View style={styles.iconContainer}>
                                    <Ionicons name={cuenta.icono} size={24} color="#1A1A1A" />
                                </View>
                                <View>
                                    <Text style={styles.accountTitle}>{cuenta.nombre}</Text>
                                    {cuenta.presupuesto > 0 && (
                                        <Text style={styles.accountBudget}>
                                            Gastado ${cuenta.gastado.toFixed(2)} de ${cuenta.presupuesto.toFixed(2)}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <Text style={styles.accountAmount}>
                                {cuenta.saldo >= 0 ? '$' : '-$'}{Math.abs(cuenta.saldo).toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}

                {cuentasFiltradas.length > 0 && (
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Balance Total</Text>
                        <Text style={styles.balanceAmount}>
                            {getBalanceTotal() >= 0 ? '$' : '-$'}{Math.abs(getBalanceTotal())}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={styles.addAccountButton}
                    onPress={abrirModalAgregar}
                >
                    <Text style={styles.addAccountText}>Agregar Cuenta</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Botón Flotante (FAB) funcional */}
            <BotonAgregarTransaccion onTransaccionGuardada={cargarDatos} />

            {/* Modal para agregar/editar cuenta */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={28} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>
                            {editando ? 'Editar Cuenta' : 'Nueva Cuenta'}
                        </Text>
                        <TouchableOpacity onPress={guardarCuentaNueva}>
                            <Text style={styles.saveButton}>Guardar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {/* Icono */}
                        <TouchableOpacity
                            style={styles.iconSelector}
                            onPress={() => setModalIconos(true)}
                        >
                            <Text style={styles.label}>Icono</Text>
                            <View style={styles.iconSelectorContent}>
                                <View style={styles.iconPreview}>
                                    <Ionicons name={iconoSeleccionado} size={32} color="#4A8FE7" />
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#999" />
                            </View>
                        </TouchableOpacity>

                        {/* Nombre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nombre de la cuenta</Text>
                            <TextInput
                                style={styles.input}
                                value={nombreCuenta}
                                onChangeText={setNombreCuenta}
                                placeholder="Ej: Mi cuenta de ahorros"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Saldo */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Saldo inicial</Text>
                            <TextInput
                                style={styles.input}
                                value={saldoCuenta}
                                onChangeText={setSaldoCuenta}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Presupuesto (opcional) */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Presupuesto mensual (opcional)</Text>
                            <TextInput
                                style={styles.input}
                                value={presupuestoCuenta}
                                onChangeText={setPresupuestoCuenta}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor="#999"
                            />
                        </View>

                        {/* Gastado (si hay presupuesto) */}
                        {presupuestoCuenta !== '' && parseFloat(presupuestoCuenta) > 0 && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Gastado hasta ahora</Text>
                                <TextInput
                                    style={styles.input}
                                    value={gastadoCuenta}
                                    onChangeText={setGastadoCuenta}
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        )}

                        {editando && (
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setTimeout(() => confirmarEliminar(cuentaSeleccionada), 300);
                                }}
                            >
                                <Text style={styles.deleteButtonText}>Eliminar Cuenta</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Modal para seleccionar icono */}
            <Modal
                visible={modalIconos}
                animationType="slide"
                transparent={true}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalIconos(false)}
                >
                    <View style={styles.iconModalContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <Text style={styles.iconModalTitle}>Seleccionar Icono</Text>
                            <View style={styles.iconGrid}>
                                {ICONOS_DISPONIBLES.map((icono) => (
                                    <TouchableOpacity
                                        key={icono.nombre}
                                        style={[
                                            styles.iconOption,
                                            iconoSeleccionado === icono.nombre && styles.iconOptionSelected
                                        ]}
                                        onPress={() => seleccionarIcono(icono.nombre)}
                                    >
                                        <Ionicons
                                            name={icono.nombre}
                                            size={32}
                                            color={iconoSeleccionado === icono.nombre ? '#4A8FE7' : '#666'}
                                        />
                                        <Text style={[
                                            styles.iconLabel,
                                            iconoSeleccionado === icono.nombre && styles.iconLabelSelected
                                        ]}>
                                            {icono.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
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
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
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
        marginBottom: 24,
    },
    addAccountText: {
        fontSize: 16,
        color: '#2196F3',
        fontWeight: '600',
    },
    // Estilos del modal
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    saveButton: {
        fontSize: 16,
        color: '#4A8FE7',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 20,
    },
    iconSelector: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    iconSelectorContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    iconPreview: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputGroup: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        fontSize: 16,
        color: '#000',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        paddingVertical: 8,
    },
    deleteButton: {
        backgroundColor: '#FFE5E5',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    deleteButtonText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
    // Modal de iconos
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    iconModalContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '60%',
    },
    iconModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        padding: 20,
        textAlign: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
    },
    iconOption: {
        width: '22%',
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
    },
    iconOptionSelected: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: '#4A8FE7',
    },
    iconLabel: {
        fontSize: 10,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    iconLabelSelected: {
        color: '#4A8FE7',
        fontWeight: '600',
    },
});