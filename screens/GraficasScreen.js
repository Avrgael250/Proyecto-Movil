import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Dimensions, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import BotonAgregarTransaccion from '../components/BotonAgregarTransaccion';
import { obtenerColorCategoria, obtenerCategoria } from '../constants/categories';
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
    obtenerResumenEgresos, // Función para Egresos (nueva)
    obtenerHistorialPorCategoria // Nueva función para historial
} from '../database/database';

const { width } = Dimensions.get('window');

const opcionesReporte = ['Gastos', 'Ingresos', 'Historial'];
const opcionesTiempo = ['Mensual', 'Trimestral', 'Anual'];

// Usar colores centralizados
const getColor = (categoryName) => obtenerColorCategoria(categoryName);

// Función para obtener icono de categoría (usar categorías centralizadas)
const getCategoriaIcon = (categoria) => {
    const catData = obtenerCategoria(categoria);
    return catData.icono ? `${catData.icono}-outline` : 'cash-outline';
};

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
    const route = useRoute();

    // Verificar si viene con tab inicial desde navegación
    const tabInicial = route.params?.tab || 'Gastos';

    // Convertir nombre antiguo si viene de navegación anterior
    const tabNormalizado = tabInicial === 'Historial de gasto' ? 'Historial' : tabInicial;

    const [reporteSeleccionado, setReporteSeleccionado] = useState(tabNormalizado);
    const [tiempoSeleccionado, setTiempoSeleccionado] = useState('Mensual');
    const [currentData, setCurrentData] = useState([]);
    const [historialData, setHistorialData] = useState([]);
    const [lastReporte, setLastReporte] = useState('Gastos');
    const [usuarioEmail, setUsuarioEmail] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [periodoIndex, setPeriodoIndex] = useState(0); // Para navegar entre periodos

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

    // Función para obtener el rango de fechas según el periodo
    const obtenerRangoFechas = (tiempo, index = 0) => {
        const now = new Date();
        const mesesNombres = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
        const añoBase = now.getFullYear();
        const mesActual = now.getMonth(); // 0-11 (noviembre = 10)

        if (tiempo === 'Mensual') {
            // Mostrar 4 meses por vista, navegables
            // index 0 = meses actuales (ej: sep, oct, nov, dic)
            // index 1 = 4 meses antes (ej: may, jun, jul, ago)
            const mesesPorVista = 4;
            const offsetMeses = index * mesesPorVista;

            // Calcular el mes final (actual - offset)
            const mesFinal = mesActual - offsetMeses;
            const mesInicial = mesFinal - (mesesPorVista - 1);

            const labels = [];
            const mesesData = [];

            for (let i = mesInicial; i <= mesFinal; i++) {
                // Manejar meses negativos (año anterior)
                let mesReal = i;
                let añoReal = añoBase;

                while (mesReal < 0) {
                    mesReal += 12;
                    añoReal--;
                }
                while (mesReal > 11) {
                    mesReal -= 12;
                    añoReal++;
                }

                labels.push(mesesNombres[mesReal]);
                mesesData.push({ mes: mesReal + 1, año: añoReal });
            }

            // Texto del rango
            const primerMes = mesesData[0];
            const ultimoMes = mesesData[mesesData.length - 1];
            const textoInicio = `${mesesNombres[primerMes.mes - 1]} ${primerMes.año}`;
            const textoFin = `${mesesNombres[ultimoMes.mes - 1]} ${ultimoMes.año}`;

            return { labels, mesesData, texto: `${textoInicio} - ${textoFin}` };
        } else if (tiempo === 'Trimestral') {
            // Navegar por años en trimestres
            const año = añoBase - index;
            const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            const trimestresData = [
                { inicio: 1, fin: 3, año },
                { inicio: 4, fin: 6, año },
                { inicio: 7, fin: 9, año },
                { inicio: 10, fin: 12, año }
            ];
            return { labels, trimestresData, año, texto: `Trimestres ${año}` };
        } else {
            // Navegar por rangos de 5 años
            const añoFin = añoBase - (index * 5);
            const labels = [];
            const añosData = [];
            for (let i = 4; i >= 0; i--) {
                const añoLabel = (añoFin - i).toString();
                labels.push(añoLabel);
                añosData.push(añoFin - i);
            }
            return { labels, añosData, añoFin, texto: `${labels[0]} - ${labels[4]}` };
        }
    };

    // Función principal para cargar datos de la base de datos
    const cargarDatosGraficas = useCallback(async (reporte, tiempo, indice = 0) => {
        setIsLoading(true);
        const sesion = await obtenerSesion();

        if (!sesion?.usuario_email) {
            setUsuarioEmail(null);
            setCurrentData([]);
            setHistorialData([]);
            setIsLoading(false);
            return;
        }

        const email = sesion.usuario_email;
        setUsuarioEmail(email);

        try {
            if (reporte === 'Historial') {
                // Cargar datos para gráficas de línea por categoría
                const rango = obtenerRangoFechas(tiempo, indice);
                const historial = await obtenerHistorialPorCategoria(email, tiempo, rango);
                setHistorialData(historial);
                setCurrentData([]);
            } else if (reporte === 'Ingresos') {
                // Usa obtenerResumenPorCategoria con el tipo 'Ingreso'
                const resumenDb = await obtenerResumenPorCategoria(email, 'Ingreso');
                const dataFormateada = procesarDatosParaGrafica(resumenDb);
                setCurrentData(dataFormateada);
                setHistorialData([]);
            } else if (reporte === 'Gastos') {
                // Usa la nueva función que suma 'Gasto', 'Pago' y 'Reembolso'
                const resumenDb = await obtenerResumenEgresos(email);
                const dataFormateada = procesarDatosParaGrafica(resumenDb);
                setCurrentData(dataFormateada);
                setHistorialData([]);
            }

        } catch (error) {
            console.error('Error al cargar datos de gráfica:', error);
            setCurrentData([]);
            setHistorialData([]);
        } finally {
            setIsLoading(false);
        }

    }, []);

    // Función de recarga para el botón
    const handleTransaccionGuardada = () => {
        // Recargar los datos con el reporte y tiempo actual
        cargarDatosGraficas(reporteSeleccionado, tiempoSeleccionado);
    };

    // Actualizar cuando cambia el tab desde navegación
    useEffect(() => {
        if (route.params?.tab) {
            setReporteSeleccionado(route.params.tab);
        }
    }, [route.params?.tab]);

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
            cargarDatosGraficas(reporteSeleccionado, tiempoSeleccionado, periodoIndex);
        }

        return () => {
            showSystemBars();
        };
    }, [isFocused, reporteSeleccionado, tiempoSeleccionado, periodoIndex, cargarDatosGraficas]);

    useEffect(() => {
        // Lógica para actualizar lastReporte al cambiar el reporteSeleccionado
        if (reporteSeleccionado !== 'Historial') {
            setLastReporte(reporteSeleccionado);
        }
    }, [reporteSeleccionado]);

    // Resetear periodoIndex cuando cambia el tipo de tiempo
    useEffect(() => {
        setPeriodoIndex(0);
    }, [tiempoSeleccionado]);

    const isHistorial = reporteSeleccionado === 'Historial';
    const rangoFechas = obtenerRangoFechas(tiempoSeleccionado, periodoIndex);

    // Componente para renderizar gráficas de línea por categoría
    const renderHistorialGraficas = () => {
        if (historialData.length === 0) {
            return (
                <View style={styles.noDataContainer}>
                    <Ionicons name="bar-chart-outline" size={64} color="#ccc" />
                    <Text style={styles.historialTexto}>No hay datos de historial disponibles</Text>
                </View>
            );
        }

        const chartConfig = {
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(74, 143, 231, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: {
                r: '4',
                strokeWidth: '2',
            },
        };

        // Determinar el número de datos según el tipo de tiempo
        const getDefaultData = () => {
            if (tiempoSeleccionado === 'Mensual') return [0, 0, 0, 0]; // 4 meses
            if (tiempoSeleccionado === 'Trimestral') return [0, 0, 0, 0]; // 4 trimestres
            return [0, 0, 0, 0, 0]; // 5 años
        };

        // Calcular el ancho de la gráfica según el tipo de tiempo
        const getChartWidth = () => {
            if (tiempoSeleccionado === 'Mensual') return width - 40; // 4 meses caben bien
            if (tiempoSeleccionado === 'Trimestral') return width - 40; // 4 trimestres caben bien
            return width - 40; // 5 años caben bien
        };

        const defaultData = getDefaultData();
        const chartWidth = getChartWidth();

        return (
            <View>
                {/* Gráfica General de Gasto Total */}
                <View style={styles.historialCard}>
                    <Text style={styles.historialCardTitle}>Gasto Total</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <LineChart
                            data={{
                                labels: rangoFechas.labels,
                                datasets: [{
                                    data: historialData.find(c => c.categoria === 'Total')?.datos || defaultData,
                                    color: (opacity = 1) => `rgba(74, 143, 231, ${opacity})`,
                                    strokeWidth: 3
                                }]
                            }}
                            width={chartWidth}
                            height={180}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.lineChart}
                            withDots={true}
                            withInnerLines={true}
                            withOuterLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                            fromZero={true}
                            renderDotContent={({ x, y, index, indexData }) => (
                                <Text
                                    key={index}
                                    style={{
                                        position: 'absolute',
                                        top: y - 20,
                                        left: x - 15,
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                        color: '#4A8FE7'
                                    }}
                                >
                                    ${indexData}
                                </Text>
                            )}
                        />
                    </ScrollView>
                </View>

                {/* Gráficas por Categoría */}
                {historialData.filter(c => c.categoria !== 'Total').map((categoria, index) => {
                    const colores = ['#4CAF50', '#E91E63', '#9C27B0', '#FF9800', '#00BCD4', '#795548'];
                    const color = colores[index % colores.length];

                    return (
                        <View key={categoria.categoria} style={styles.historialCard}>
                            <View style={styles.categoriaHeader}>
                                <View style={[styles.categoriaIcon, { backgroundColor: color + '20' }]}>
                                    <Ionicons
                                        name={getCategoriaIcon(categoria.categoria)}
                                        size={20}
                                        color={color}
                                    />
                                </View>
                                <Text style={styles.historialCardTitle}>{categoria.categoria}</Text>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <LineChart
                                    data={{
                                        labels: rangoFechas.labels,
                                        datasets: [{
                                            data: categoria.datos.length > 0 ? categoria.datos : defaultData,
                                            color: (opacity = 1) => color,
                                            strokeWidth: 3
                                        }]
                                    }}
                                    width={chartWidth}
                                    height={160}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) => color,
                                    }}
                                    bezier
                                    style={styles.lineChart}
                                    withDots={true}
                                    fromZero={true}
                                    renderDotContent={({ x, y, index, indexData }) => (
                                        <Text
                                            key={index}
                                            style={{
                                                position: 'absolute',
                                                top: y - 20,
                                                left: x - 15,
                                                fontSize: 10,
                                                fontWeight: 'bold',
                                                color: color
                                            }}
                                        >
                                            ${indexData}
                                        </Text>
                                    )}
                                />
                            </ScrollView>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safearea}>
            <View style={styles.contenedorPrincipal}>
                <Text style={styles.tituloPrincipal}>Análisis</Text>

                <OpcionSelector
                    opciones={opcionesReporte}
                    selected={reporteSeleccionado}
                    onSelect={setReporteSeleccionado}
                />

                <ScrollView contentContainerStyle={styles.contenidoScroll}>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#4A8FE7" />
                            <Text style={styles.loadingText}>Cargando datos...</Text>
                        </View>
                    ) : isHistorial ? (
                        <View style={styles.historialMainContainer}>
                            {/* Selector de tiempo para historial */}
                            <View style={styles.historialCard}>
                                <TiempoSelector
                                    opciones={opcionesTiempo}
                                    selected={tiempoSeleccionado}
                                    onSelect={setTiempoSeleccionado}
                                />

                                {/* Navegación de periodo */}
                                <View style={styles.periodoNav}>
                                    <TouchableOpacity onPress={() => setPeriodoIndex(periodoIndex + 1)}>
                                        <Ionicons name="chevron-back" size={24} color="#030213" />
                                    </TouchableOpacity>
                                    <Text style={styles.periodoTexto}>{rangoFechas.texto}</Text>
                                    <TouchableOpacity
                                        onPress={() => setPeriodoIndex(Math.max(0, periodoIndex - 1))}
                                        disabled={periodoIndex === 0}
                                    >
                                        <Ionicons
                                            name="chevron-forward"
                                            size={24}
                                            color={periodoIndex === 0 ? '#ccc' : '#030213'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {renderHistorialGraficas()}
                        </View>
                    ) : (
                        <GraficoPastelFuncional
                            data={currentData}
                            tiempoSeleccionado={tiempoSeleccionado}
                            onSelectTiempo={setTiempoSeleccionado}
                        />
                    )}

                </ScrollView>
            </View>
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
    // Header con flecha de regreso
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    // Estilos para historial con gráficas de línea
    historialMainContainer: {
        width: '100%',
    },
    historialCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    historialCardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 12,
    },
    categoriaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    categoriaIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    lineChart: {
        borderRadius: 8,
        marginLeft: -10,
    },
    periodoNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        gap: 20,
    },
    periodoTexto: {
        fontSize: 16,
        fontWeight: '600',
        color: '#030213',
    },
    noDataContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
});