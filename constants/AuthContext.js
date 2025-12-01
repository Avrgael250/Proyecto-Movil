import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

// Crear el contexto
const AuthContext = createContext();

// Provider de autenticación biométrica
export const AuthProvider = ({ children }) => {
    const [biometriaHabilitada, setBiometriaHabilitada] = useState(false);
    const [biometriaDisponible, setBiometriaDisponible] = useState(false);
    const [tipoBiometria, setTipoBiometria] = useState(null);
    const [autenticado, setAutenticado] = useState(false);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        verificarDisponibilidadBiometria();
        cargarPreferenciaBiometria();
    }, []);

    // Verificar si el dispositivo soporta biometría
    const verificarDisponibilidadBiometria = async () => {
        try {
            const compatible = await LocalAuthentication.hasHardwareAsync();
            const inscrita = await LocalAuthentication.isEnrolledAsync();

            setBiometriaDisponible(compatible && inscrita);

            if (compatible && inscrita) {
                const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
                if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                    setTipoBiometria('face');
                } else if (tipos.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                    setTipoBiometria('fingerprint');
                }
            }
        } catch (error) {
            setBiometriaDisponible(false);
        }
    };

    // Cargar preferencia guardada
    const cargarPreferenciaBiometria = async () => {
        try {
            const preferencia = await AsyncStorage.getItem('biometria_habilitada');
            const habilitada = preferencia === 'true';
            setBiometriaHabilitada(habilitada);

            // Si no tiene biometría habilitada, considerar autenticado
            if (!habilitada) {
                setAutenticado(true);
            }
        } catch (error) {
            setAutenticado(true);
        } finally {
            setCargando(false);
        }
    };

    // Habilitar/deshabilitar biometría
    const toggleBiometria = async () => {
        try {
            if (!biometriaHabilitada) {
                // Si va a habilitar, primero verificar que funciona
                const resultado = await autenticar();
                if (resultado) {
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

    // Realizar autenticación biométrica
    const autenticar = async () => {
        try {
            const resultado = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Desbloquea Ahorra+',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar contraseña',
            });

            if (resultado.success) {
                setAutenticado(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };

    // Bloquear la app (para cuando vuelve del background)
    const bloquear = () => {
        if (biometriaHabilitada) {
            setAutenticado(false);
        }
    };

    // Obtener nombre del tipo de biometría
    const obtenerNombreBiometria = () => {
        if (tipoBiometria === 'face') return 'Face ID';
        if (tipoBiometria === 'fingerprint') return 'Huella digital';
        return 'Biometría';
    };

    // Obtener icono del tipo de biometría
    const obtenerIconoBiometria = () => {
        if (tipoBiometria === 'face') return 'scan';
        if (tipoBiometria === 'fingerprint') return 'finger-print';
        return 'lock-closed';
    };

    return (
        <AuthContext.Provider value={{
            biometriaHabilitada,
            biometriaDisponible,
            tipoBiometria,
            autenticado,
            cargando,
            toggleBiometria,
            autenticar,
            bloquear,
            obtenerNombreBiometria,
            obtenerIconoBiometria,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook para usar autenticación
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};

export default AuthContext;
