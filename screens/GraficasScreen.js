import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { PieChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const opcionesReporte = ['Ingresos', 'Egresos', 'Historial'];
const opcionesTiempo = ['Semana', 'Mes', 'Año'];

const dataEgresosBase = [
    { name: 'Comida', population: 40, color: '#F4D03F' }, 
    { name: 'Transporte', population: 28, color: '#5DADE2' },
    { name: 'Servicios', population: 22, color: '#EC7063' },
    { name: 'Otros', population: 10, color: '#FF9800' },
];

const dataIngresosBase = [
    { name: 'Salario', population: 72, color: '#5DADE2' },
    { name: 'Inversiones', population: 20, color: '#F4D03F' },
    { name: 'Extras', population: 8, color: '#EC7063' },
];

const OpcionSelector = ({ opciones, selected, onSelect }) => (
    <View style={styles.opcionSelectorContainer}>
        {opciones.map((opcion) => (
            <TouchableOpacity
                key={opcion}
                onPress={() => onSelect(opcion)}
                style={[
                    styles.opcionBoton,
                    selected === opcion && styles.opcionBotonSeleccionado
                ]}
            >
                <Text style={[
                    styles.opcionTexto,
                    selected === opcion && styles.opcionTextoSeleccionado
                ]}>
                    {opcion}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const TiempoSelector = ({ opciones, selected, onSelect }) => (
    <View style={styles.tiempoSelectorContainer}>
        {opciones.map((opcion) => (
            <TouchableOpacity
                key={opcion}
                onPress={() => onSelect(opcion)}
                style={[
                    styles.tiempoBoton,
                    selected === opcion && styles.tiempoBotonSeleccionado,
                ]}
            >
                <Text style={[
                    styles.tiempoTexto,
                    selected === opcion && styles.tiempoTextoSeleccionado
                ]}>
                    {opcion}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
);

const GraficoPastelFuncional = ({ data, tiempoSeleccionado, onSelectTiempo }) => {
    
    // Lógica para obtener el texto de la fecha según el filtro seleccionado
    const getDynamicDateText = (selectedTime) => {
        switch (selectedTime) {
            case 'Semana':
                return '24 Nov - 30 Nov 2025';
            case 'Mes':
                return 'Noviembre de 2025';
            case 'Año':
                return '2025';
            default:
                return 'Noviembre de 2025';
        }
    };
    
    const dateText = getDynamicDateText(tiempoSeleccionado);
    
    const chartConfig = {
        backgroundGradientFrom: '#FFFFFF',
        backgroundGradientTo: '#FFFFFF',
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    };

    const chartSize = width * 0.8; 
    const chartHeight = chartSize * 0.8;
    const chartRadius = chartSize / 2;

    return (
        <View style={styles.graficoBocetoContainer}>
            <TiempoSelector 
                opciones={opcionesTiempo} 
                selected={tiempoSeleccionado}
                onSelect={onSelectTiempo}
            />

            <Text style={styles.fechaTexto}>{dateText}</Text>
            
            {data.length > 0 ? (
                <View style={styles.chartWrapper}>
                    <PieChart
                        data={data}
                        width={chartSize} 
                        height={chartHeight}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="0" 
                        center={[chartSize / 4, 0]}
                        absolute
                        radius={chartRadius} 
                        hasLegend={false}
                    />
                </View>
            ) : (
                <View style={styles.noDataContainer}>
                    <Text style={styles.historialTexto}>No hay datos de gráfica para este reporte.</Text>
                </View>
            )}

            <View style={styles.leyendaCategoria}>
                {data.map((item, index) => (
                    <View key={index} style={styles.itemLeyendaCategoria}>
                        <View style={[styles.indicadorColorLeyenda, { backgroundColor: item.color }]} /> 
                        <Text style={styles.textoPorcentaje}>{item.population}%</Text> 
                        <Text style={styles.textoLeyendaCategoria}>{item.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};


export default function GraficasScreen() {
    const isFocused = useIsFocused();
    
    const [reporteSeleccionado, setReporteSeleccionado] = useState('Egresos');
    const [tiempoSeleccionado, setTiempoSeleccionado] = useState('Mes'); 
    const [currentData, setCurrentData] = useState(dataEgresosBase); 
    // Usamos este estado auxiliar para saber qué reporte se estaba viendo antes de ir a Historial
    const [lastReporte, setLastReporte] = useState('Egresos'); 

    useEffect(() => {
        if (reporteSeleccionado === 'Ingresos') {
            setCurrentData(dataIngresosBase);
            setLastReporte('Ingresos');
        } else if (reporteSeleccionado === 'Egresos') {
            setCurrentData(dataEgresosBase);
            setLastReporte('Egresos');
        } else if (reporteSeleccionado === 'Historial') {
            setCurrentData([]); 
        }
    }, [reporteSeleccionado]);

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

    const isHistorial = reporteSeleccionado === 'Historial';

    return (
        <SafeAreaView style={styles.safearea}>
            <View style={styles.contenedorPrincipal}>
                <Text style={styles.tituloPrincipal}>Reportes Gráficos</Text>
                
                <OpcionSelector 
                    opciones={opcionesReporte} 
                    selected={reporteSeleccionado}
                    onSelect={setReporteSeleccionado}
                />

                <ScrollView contentContainerStyle={styles.contenidoScroll}>
                    
                    {!isHistorial ? (
                        <GraficoPastelFuncional 
                            data={currentData}
                            tiempoSeleccionado={tiempoSeleccionado}
                            onSelectTiempo={setTiempoSeleccionado}
                        />
                    ) : (
                        <View style={styles.historialContainer}>
                            <Text style={styles.historialTexto}>
                                Aquí se mostraría una tabla o lista de transacciones.
                            </Text>
                            <Text style={styles.historialSubTexto}>
                                Tipo: "{lastReporte}" || Tiempo: "{tiempoSeleccionado}"
                            </Text>
                        </View>
                    )}

                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

// --- ZONA DE ESTILOS ---

const styles = StyleSheet.create({
    safearea: {
        flex: 1,
        backgroundColor: '#E3F2FD',
    },
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    tituloPrincipal: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#030213',
    },
    contenidoScroll: {
        paddingBottom: 80,
        alignItems: 'center',
    },
    opcionSelectorContainer: {
        flexDirection: 'row',
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#666666',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    opcionBoton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    opcionBotonSeleccionado: {
        borderBottomWidth: 2, 
        borderBottomColor: '#4A8FE7',
    },
    opcionTexto: {
        fontSize: 14,
        color: '#666666',
        paddingHorizontal: 5,
    },
    opcionTextoSeleccionado: {
        fontWeight: 'bold',
        color: '#4A8FE7', 
    },

    graficoBocetoContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 15,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        alignItems: 'center',
    },

    tiempoSelectorContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#666666',
        borderRadius: 8,
        width: '100%',
        overflow: 'hidden',
    },
    tiempoBoton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    tiempoBotonSeleccionado: {
        backgroundColor: '#4A8FE7',
    },
    tiempoTexto: {
        fontSize: 14,
        color: '#666666',
    },
    tiempoTextoSeleccionado: {
        fontWeight: 'bold',
        color: '#fff', 
    },
    
    fechaTexto: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: 'bold',
        color: '#030213',
        textAlign: 'center',
    },

    chartWrapper: {
        alignItems: 'center', 
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
    },

    leyendaCategoria: {
        width: '100%',
        paddingTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    itemLeyendaCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        width: '50%',
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
        fontWeight: 'bold',
        color: '#030213',
    },
    textoLeyendaCategoria: {
        fontSize: 14,
        color: '#666666',
    },

    historialContainer: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        minHeight: 200,
        justifyContent: 'center',
    },
    historialTexto: {
        fontSize: 16,
        color: '#030213',
        textAlign: 'center',
        marginBottom: 10,
    },
    historialSubTexto: {
        fontSize: 14,
        color: '#666666',
        textAlign: 'center',
    },
});