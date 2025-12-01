import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const ConfiguracionScreen = ({ navigation }) => {
    const [biometriaHabilitada, setBiometriaHabilitada] = useState(false);
    const [biometriaDisponible, setBiometriaDisponible] = useState(false);
    const [tipoBiometria, setTipoBiometria] = useState('fingerprint');

    useEffect(() => {
        verificarDisponibilidad();
        cargarPreferencia();
    }, []);

    const verificarDisponibilidad = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const inscrita = await LocalAuthentication.isEnrolledAsync();
            setBiometriaDisponible(compatible && inscrita);

            if (compatible && inscrita) {
                const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setTipoBiometria('face');
                }
            }
        } catch (error) {
            setBiometriaDisponible(false);
        }
    };

    const cargarPreferencia = async () => {
        try {
            const valor = await AsyncStorage.getItem('biometria_habilitada');
            setBiometriaHabilitada(valor === 'true');
        } catch (error) {
            // Error silencioso
        }
    };

    const toggleBiometria = async () => {
        if (!biometriaDisponible) {
            Alert.alert(
                'No disponible',
                'Tu dispositivo no tiene autenticación biométrica configurada.',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            if (!biometriaHabilitada) {
                // Verificar que funciona antes de habilitar
                const resultado = await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Verifica tu identidad para habilitar',
                    cancelLabel: 'Cancelar',
                });

                if (resultado.success) {
                    await AsyncStorage.setItem('biometria_habilitada', 'true');
                    setBiometriaHabilitada(true);
                    Alert.alert('Éxito', 'Autenticación biométrica habilitada');
                }
            } else {
                await AsyncStorage.setItem('biometria_habilitada', 'false');
                setBiometriaHabilitada(false);
                Alert.alert('Éxito', 'Autenticación biométrica deshabilitada');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo cambiar la configuración');
        }
    };

    const obtenerNombreBiometria = () => {
        return tipoBiometria === 'face' ? 'Face ID' : 'Huella digital';
    };

    const obtenerIconoBiometria = () => {
        return tipoBiometria === 'face' ? 'scan' : 'finger-print';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#030213" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Configuración</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Contenido */}
            <View style={styles.content}>
                {/* Sección Seguridad */}
                <Text style={styles.sectionTitle}>SEGURIDAD</Text>

                <View style={styles.card}>
                    <View style={[styles.item, !biometriaDisponible && styles.itemDisabled]}>
                        <View style={styles.itemIcon}>
                            <Ionicons
                                name={obtenerIconoBiometria()}
                                size={24}
                                color="#4A8FE7"
                            />
                        </View>
                        <View style={styles.itemContent}>
                            <Text style={styles.itemTitle}>{obtenerNombreBiometria()}</Text>
                            <Text style={styles.itemDescription}>
                                {biometriaDisponible
                                    ? 'Protege tu app con biometría'
                                    : 'No disponible en este dispositivo'
                                }
                            </Text>
                        </View>
                        <Switch
                            value={biometriaHabilitada}
                            onValueChange={toggleBiometria}
                            trackColor={{ false: '#E0E0E0', true: '#4A8FE7' }}
                            thumbColor="#FFFFFF"
                            disabled={!biometriaDisponible}
                        />
                    </View>
                </View>

                {/* Info */}
                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#4A8FE7" />
                    <Text style={styles.infoText}>
                        Al activar esta opción, se te pedirá autenticarte cada vez que abras la app.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#030213',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
        marginBottom: 12,
        marginLeft: 4,
        letterSpacing: 1,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    itemDisabled: {
        opacity: 0.5,
    },
    itemIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        color: '#030213',
        fontWeight: '500',
    },
    itemDescription: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
});

export default ConfiguracionScreen;
