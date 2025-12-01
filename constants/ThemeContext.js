import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Definición de temas
export const temaClaro = {
    modo: 'claro',
    colores: {
        fondo: '#F5F5F5',
        fondoSecundario: '#FFFFFF',
        fondoTarjeta: '#FFFFFF',
        fondoModal: '#FFFFFF',
        fondoInput: '#F5F5F5',

        texto: '#000000',
        textoSecundario: '#666666',
        textoTerciario: '#999999',
        textoInverso: '#FFFFFF',

        primario: '#4A8FE7',
        primarioClaro: '#E3F2FD',

        exito: '#4CAF50',
        exitoClaro: '#E8F5E9',

        error: '#F44336',
        errorClaro: '#FFEBEE',

        advertencia: '#FF9800',
        advertenciaClaro: '#FFF3E0',

        borde: '#E0E0E0',
        bordeClaro: '#F0F0F0',

        sombra: '#000000',

        ingreso: '#4CAF50',
        egreso: '#F44336',

        tabBar: '#FFFFFF',
        tabBarIcono: '#999999',
        tabBarIconoActivo: '#4A8FE7',

        statusBar: 'dark-content',
    },
};

export const temaOscuro = {
    modo: 'oscuro',
    colores: {
        fondo: '#121212',
        fondoSecundario: '#1E1E1E',
        fondoTarjeta: '#252525',
        fondoModal: '#2C2C2C',
        fondoInput: '#333333',

        texto: '#FFFFFF',
        textoSecundario: '#B0B0B0',
        textoTerciario: '#808080',
        textoInverso: '#000000',

        primario: '#5A9FF7',
        primarioClaro: '#1A3A5C',

        exito: '#66BB6A',
        exitoClaro: '#1B3B1B',

        error: '#EF5350',
        errorClaro: '#3B1B1B',

        advertencia: '#FFA726',
        advertenciaClaro: '#3B2B1B',

        borde: '#404040',
        bordeClaro: '#333333',

        sombra: '#000000',

        ingreso: '#66BB6A',
        egreso: '#EF5350',

        tabBar: '#1E1E1E',
        tabBarIcono: '#808080',
        tabBarIconoActivo: '#5A9FF7',

        statusBar: 'light-content',
    },
};

// Crear el contexto
const ThemeContext = createContext();

// Provider del tema
export const ThemeProvider = ({ children }) => {
    const [temaActual, setTemaActual] = useState(temaClaro);
    const [cargando, setCargando] = useState(true);

    // Cargar preferencia de tema al iniciar
    useEffect(() => {
        cargarPreferenciaTema();
    }, []);

    const cargarPreferenciaTema = async () => {
        try {
            const temaGuardado = await AsyncStorage.getItem('tema_preferido');
            if (temaGuardado === 'oscuro') {
                setTemaActual(temaOscuro);
            } else {
                setTemaActual(temaClaro);
            }
        } catch (error) {
            // Si hay error, usar tema claro por defecto
            setTemaActual(temaClaro);
        } finally {
            setCargando(false);
        }
    };

    const cambiarTema = async () => {
        const nuevoTema = temaActual.modo === 'claro' ? temaOscuro : temaClaro;
        setTemaActual(nuevoTema);
        try {
            await AsyncStorage.setItem('tema_preferido', nuevoTema.modo);
        } catch (error) {
            // Error silencioso
        }
    };

    const establecerTema = async (modo) => {
        const nuevoTema = modo === 'oscuro' ? temaOscuro : temaClaro;
        setTemaActual(nuevoTema);
        try {
            await AsyncStorage.setItem('tema_preferido', modo);
        } catch (error) {
            // Error silencioso
        }
    };

    const esOscuro = temaActual.modo === 'oscuro';

    return (
        <ThemeContext.Provider value={{
            tema: temaActual,
            colores: temaActual.colores,
            esOscuro,
            cambiarTema,
            establecerTema,
            cargando
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Hook para usar el tema
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme debe usarse dentro de un ThemeProvider');
    }
    return context;
};

export default ThemeContext;
