import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';

const LockScreen = ({ onUnlock }) => {
    const [intentando, setIntentando] = useState(false);
    const [error, setError] = useState('');
    const [tipoBiometria, setTipoBiometria] = useState('fingerprint');
    const pulseAnim = new Animated.Value(1);

    useEffect(() => {
        verificarTipoBiometria();
        // Intentar autenticar automáticamente al cargar
        handleAutenticar();

        // Animación de pulso
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const verificarTipoBiometria = async () => {
        try {
            const tipos = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                setTipoBiometria('face');
            } else {
                setTipoBiometria('fingerprint');
            }
        } catch (error) {
            setTipoBiometria('fingerprint');
        }
    };

    const handleAutenticar = async () => {
        if (intentando) return;

        setIntentando(true);
        setError('');

        try {
            const resultado = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Desbloquea Ahorra+',
                cancelLabel: 'Cancelar',
                disableDeviceFallback: false,
                fallbackLabel: 'Usar contraseña',
            });

            if (resultado.success) {
                onUnlock && onUnlock();
            } else {
                setError('Autenticación fallida. Intenta de nuevo.');
            }
        } catch (err) {
            setError('Error al autenticar');
        }

        setIntentando(false);
    };

    const obtenerNombreBiometria = () => {
        return tipoBiometria === 'face' ? 'Face ID' : 'Huella digital';
    };

    const obtenerIconoBiometria = () => {
        return tipoBiometria === 'face' ? 'scan' : 'finger-print';
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.logo}>
                <Text style={styles.logoText}>Ahorra+</Text>
                <Text style={styles.logoSubtext}>Tu app de finanzas personales</Text>
            </View>

            <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons
                    name={obtenerIconoBiometria()}
                    size={60}
                    color="#4A8FE7"
                />
            </Animated.View>

            <Text style={styles.mensaje}>Desbloquea tu app</Text>
            <Text style={styles.submensaje}>
                Usa {obtenerNombreBiometria()} para acceder a tu información
            </Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
                style={[styles.boton, intentando && styles.botonDeshabilitado]}
                onPress={handleAutenticar}
                disabled={intentando}
            >
                <Ionicons name={obtenerIconoBiometria()} size={24} color="#FFFFFF" />
                <Text style={styles.botonTexto}>
                    {intentando ? 'Verificando...' : `Usar ${obtenerNombreBiometria()}`}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    logo: {
        marginBottom: 40,
        alignItems: 'center',
    },
    logoText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#4A8FE7',
    },
    logoSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mensaje: {
        fontSize: 18,
        color: '#030213',
        textAlign: 'center',
        marginBottom: 10,
        fontWeight: '600',
    },
    submensaje: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    error: {
        fontSize: 14,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 20,
    },
    boton: {
        backgroundColor: '#4A8FE7',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    botonTexto: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    botonDeshabilitado: {
        opacity: 0.6,
    },
});

export default LockScreen;
