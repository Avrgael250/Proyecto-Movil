import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';

// Datos Opciones de Reporte
const opcionesReporte = [ 
    'Ingresos', 
    'Egresos', 
    'Historial', 
];

// Datos Opciones de Tiempo
const opcionesTiempo = [
    'Semana',
    'Mes',
    'Año',
];

// Datos para la gráfica pastel
const categoriasData = [
    { name: 'Comida', percentage: '40%', color: '#F4D03F' }, // Amarillo
    { name: 'Transporte', percentage: '28%', color: '#5DADE2' }, // Azul
    { name: 'Servicios', percentage: '22%', color: '#EC7063' }, // Rojo
    { name: 'Otros', percentage: '10%', color: '#f5ae2cff' }, // Naranja 
];

// Selector de Opciones (Ingresos, Egresos, Historial)
const OpcionSelector = ({ opciones, selected, onSelect }) => (
    <View style={styles.opcionSelectorContainer}>
        {opciones.map((opcion, index) => (
            <TouchableOpacity
                key={index}
                style={[
                    styles.opcionBoton,
                    index === 0 && styles.opcionBotonSeleccionado // Simular 'Ingresos' como seleccionado
                ]}
            >
                <Text style={[
                    styles.opcionTexto,
                    index === 0 && styles.opcionTextoSeleccionado
                ]}>
                    {opcion}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

// Selector de Tiempo (Semana, Mes, Año)
const TiempoSelector = ({ opciones, selected, onSelect }) => (
    <View style={styles.tiempoSelectorContainer}>
        {opciones.map((opcion, index) => (
            <TouchableOpacity
                key={index}
                style={[
                    styles.tiempoBoton,
                    index === 1 && styles.tiempoBotonSeleccionado // Simular Mes seleccionado
                ]}
            >
                <Text style={[
                    styles.tiempoTexto,
                    index === 1 && styles.tiempoTextoSeleccionado
                ]}>
                    {opcion}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

// Gráfico de Pastel y Leyenda
const GraficoPastelBoceto = ({ title, selectedDate, data }) => {
    // Se extraen los colores para simular el gráfico de pastel con bordes
    const [color1, color2, color3, color4] = data.map(d => d.color);

    return (
        <View style={styles.graficoBocetoContainer}>
            <TiempoSelector opciones={opcionesTiempo} />

            <Text style={styles.fechaTexto}>Noviembre de 2025</Text>
            
            <View style={styles.contenidoGrafico}>
                {/* Contenedor del Gráfico de Pastel Simulado */}
                <View style={styles.contenedorGraficoPastel}>
                    <View style={[
                        styles.graficoPastelSimulado, 
                        {
                            // Estos bordes simulan las secciones del pastel
                            borderColor: color1,
                            borderRightColor: color2,
                            borderBottomColor: color3,
                            borderTopColor: color4,
                        }
                    ]} />
                </View>

                {/* Leyenda de Categorías */}
                <View style={styles.leyendaCategoria}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.itemLeyendaCategoria}>
                            <View style={[styles.indicadorColorLeyenda, { backgroundColor: item.color, marginRight: 8 }]} />
                            <Text style={styles.textoPorcentaje}> ejemplo %</Text>
                            <Text style={styles.textoLeyendaCategoria}>{item.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default function GraficasScreen() {
    const isFocused = useIsFocused();
    
    // Logica para ocultar/mostrar barras de sistema
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

    return (
        <SafeAreaView style={styles.safearea}>
            <View style={styles.contenedorPrincipal}>
                <Text style={styles.tituloPrincipal}>Reportes Gráficos</Text>
                
                <ScrollView contentContainerStyle={styles.contenidoScroll}>
                    
                    {/* Selector principal: Ingresos / Egresos / Historial */}
                    <OpcionSelector opciones={opcionesReporte} />

                    {/* Gráfico y Selectores de Tiempo */}
                    <GraficoPastelBoceto data={categoriasData} />

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 20, // Aumentado el padding para centrar más el contenido
        paddingTop: 15,
    },
    tituloPrincipal: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    contenidoScroll: {
        paddingBottom: 20,
        alignItems: 'center', // Centra el contenido horizontalmente
    },
    // Estilos para OpcionSelector (Ingresos/Egresos/Historial)
    opcionSelectorContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
    },
    opcionBoton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    opcionBotonSeleccionado: {
        backgroundColor: 'transparent',
        borderBottomWidth: 2, // Simula el borde inferior de selección
        borderBottomColor: '#3498DB', // Color azul
    },
    opcionTexto: {
        fontSize: 14,
        color: '#555',
        paddingHorizontal: 5,
    },
    opcionTextoSeleccionado: {
        fontWeight: 'bold',
        color: '#3498DB', // Color azul
    },

    // Estilos para GraficoPastelBoceto (Contenedor principal de la gráfica)
    graficoBocetoContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        alignItems: 'center',
    },

    // Estilos para TiempoSelector (Semana/Mes/Año)
    tiempoSelectorContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '80%', // Limita el ancho del selector
    },
    tiempoBoton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    tiempoBotonSeleccionado: {
        backgroundColor: '#3498DB', // Color azul
        borderRadius: 7,
    },
    tiempoTexto: {
        fontSize: 14,
        color: '#555',
    },
    tiempoTextoSeleccionado: {
        fontWeight: 'bold',
        color: '#fff', // Texto blanco
    },
    
    // Estilos de la Fecha
    fechaTexto: {
        fontSize: 16,
        marginBottom: 20,
        fontWeight: 'bold',
        color: '#333',
    },

    // Contenido del gráfico
    contenidoGrafico: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    contenedorGraficoPastel: {
        width: '45%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    graficoPastelSimulado: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 75, // Grosor para simular las secciones
        // Los colores del borde se definen en el componente
    },
    
    // Estilos de la Leyenda
    leyendaCategoria: {
        width: '55%',
        paddingLeft: 10,
    },
    itemLeyendaCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    indicadorColorLeyenda: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
    textoPorcentaje: {
        fontSize: 14,
        marginRight: 5,
        color: '#717182',
    },
    textoLeyendaCategoria: {
        fontSize: 14,
        color: '#333',
    }
});