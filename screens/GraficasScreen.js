import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { PieChart } from 'react-native-chart-kit';
import BotonAgregarTransaccion from '../components/BotonAgregarTransaccion';
import {
    guardarPresupuesto,
    obtenerPresupuestosPorMes,
    obtenerPresupuestoPorCategoria,
    actualizarPresupuesto,
    eliminarPresupuesto,
    obtenerSesion,
    obtenerTransaccionesDelMes,
    actualizarTransaccion,
    eliminarTransaccion,
    obtenerResumenPorCategoria, // Función para Ingresos
    obtenerResumenEgresos // Función para Egresos (nueva)
} from '../database/database';

const { width } = Dimensions.get('window');

const opcionesReporte = ['Ingresos', 'Egresos', 'Historial'];
const opcionesTiempo = ['Semana', 'Mes', 'Año'];

// Se definen los colores para las categorías para que sean consistentes
const COLOR_MAP = {
    'Supermercado': '#F4D03F',
    'Transporte': '#5DADE2',
    'Servicios': '#EC7063',
    'Restaurantes': '#A569BD',
    'Entretenimiento': '#48C9B0',
    'Salud': '#F5B041',
    'Educación': '#D98880',
    'Ropa': '#5499C7',
    'Otros': '#85C1E9',
    'Sin categoría': '#A9CCE3',
    // Colores de Ingreso (ejemplos)
    'Salario': '#030213',
    'Inversiones': '#2ECC71',
    'Extras': '#FF9800',
};

const getColor = (categoryName) => COLOR_MAP[categoryName] || '#99A3A4';

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
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        
        switch (selectedTime) {
            case 'Semana':
                return 'Últimos 7 días';
            case 'Mes':
                return `${monthNames[now.getMonth()]} de ${year}`;
            case 'Año':
                return `${year}`;
            default:
                return 'Datos por tipo';
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
    const navigation = useNavigation();
    
    const [reporteSeleccionado, setReporteSeleccionado] = useState('Egresos');
    const [tiempoSeleccionado, setTiempoSeleccionado] = useState('Mes'); 
    const [currentData, setCurrentData] = useState([]); 
    const [lastReporte, setLastReporte] = useState('Egresos'); 
    const [usuarioEmail, setUsuarioEmail] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    // Función para procesar y formatear los datos de la DB
    const procesarDatosParaGrafica = (data) => {
        if (!data || data.length === 0) return [];
        
        const total = data.reduce((sum, item) => sum + item.total, 0);

        if (total === 0) return [];

        return data.map((item) => ({
            name: item.categoria,
            // Calcular porcentaje y redondear
            population: Math.round((item.total / total) * 100), 
            color: getColor(item.categoria),
            legendFontColor: '#7F7F7F',
            legendFontSize: 15,
        })).filter(item => item.population > 0); // Solo incluir con porcentaje > 0
    };

    // Función principal para cargar datos de la base de datos
    const cargarDatosGraficas = useCallback(async (reporte, tiempo) => {
        setIsLoading(true);
        const sesion = await obtenerSesion();

        if (!sesion?.usuario_email) {
            setUsuarioEmail(null);
            setCurrentData([]);
            setIsLoading(false);
            return;
        }

        const email = sesion.usuario_email;
        setUsuarioEmail(email);

        if (reporte === 'Historial') {
            setCurrentData([]);
            setIsLoading(false);
            return;
        }
        
        let resumenDb = [];
        try {
            if (reporte === 'Ingresos') {
                // Usa obtenerResumenPorCategoria con el tipo 'Ingreso'
                resumenDb = await obtenerResumenPorCategoria(email, 'Ingreso');
            } else if (reporte === 'Egresos') {
                // Usa la nueva función que suma 'Gasto', 'Pago' y 'Reembolso'
                resumenDb = await obtenerResumenEgresos(email); 
            }
            
            const dataFormateada = procesarDatosParaGrafica(resumenDb);
            setCurrentData(dataFormateada);

        } catch (error) {
            console.error('Error al cargar datos de gráfica:', error);
            setCurrentData([]);
        } finally {
            setIsLoading(false);
        }

    }, []); 
    
    // Función de recarga para el botón
    const handleTransaccionGuardada = () => {
        // Recargar los datos con el reporte y tiempo actual
        cargarDatosGraficas(reporteSeleccionado, tiempoSeleccionado);
    };

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
            // Carga inicial al enfocar o al cambiar de reporte/tiempo
            cargarDatosGraficas(reporteSeleccionado, tiempoSeleccionado); 
        }
    
        return () => {
            showSystemBars();
        };
    }, [isFocused, reporteSeleccionado, tiempoSeleccionado, cargarDatosGraficas]);

    useEffect(() => {
        // Lógica para actualizar lastReporte al cambiar el reporteSeleccionado
        if (reporteSeleccionado !== 'Historial') {
            setLastReporte(reporteSeleccionado);
        }
    }, [reporteSeleccionado]);

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
                    
                    {isLoading ? ( // Muestra indicador de carga
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4A8FE7" />
                            <Text style={styles.loadingText}>Cargando datos...</Text>
                        </View>
                    ) : !isHistorial ? (
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
            {/* BotonAgregarTransaccion se coloca fuera del ScrollView para que sea flotante */}
            <BotonAgregarTransaccion onTransaccionGuardada={handleTransaccionGuardada} />
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
    // Estilos nuevos para el indicador de carga
    loadingContainer: {
        width: '100%',
        height: 200, 
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});