// Zona de importaciones
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

// Para que se ajuste en el celular 
const screenWidth = Dimensions.get('window').width; 

// Datos meses opciones
const meses = [ 
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

// Datos fijos (ejemplo grafica barras)
const dataFija = {
    mes: 'Enero', 
    ingresos: 500, 
    egresos: 240, 
};

// Datos fijos (ejemplo graficas pastel)
// NOTA IMPORTANTE: Los colores AHORA se referencian por CLAVE (key) en lugar de valor hex.
// El valor hex se define abajo en styles.COLORES_CATEGORIAS.
const categoriasData = [
    { name: 'Comida', percentage: '40%', colorKey: 'comida' }, 
    { name: 'Transporte', percentage: '28%', colorKey: 'transporte' }, 
    { name: 'Servicios', percentage: '22%', colorKey: 'servicios' }, 
    { name: 'Otros', percentage: '10%', colorKey: 'otros' }, 
];

// Opcion de los meses
const MonthSelector = () => (
    <ScrollView 
        horizontal // Para ver los meses de forma horizontal
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.selectorMes}
    >
        {meses.map((mes, index) => (
            <View
                key={index}
                style={[
                    styles.botonMes,
                    index === 0 && styles.botonMesSeleccion // Para mostrar el boton seleccionado
                ]}
            >
                <Text style={[
                    styles.textoBotonMes,
                    index === 0 && styles.textoBotonMesSeleccion // Para cambiar el color de texto a seleccionar
                ]}>
                    {mes}
                </Text>
            </View>
        ))}
    </ScrollView>
);

// Grafica de barras
const GraficoBarrasMensual = ({ mesData }) => {
    // Tamaño maximo de las barras
    const maxBarHeight = 150;
    const maxValGlobal = 600; 

    const ingresosHeight = (mesData.ingresos / maxValGlobal) * maxBarHeight;
    const egresosHeight = (mesData.egresos / maxValGlobal) * maxBarHeight;

    // Accedemos a los colores de las barras a través del styles para que no estén 'hardcodeados'
    const colorIngresos = styles.colorIngresosBarra.backgroundColor;
    const colorEgresos = styles.colorEgresosBarra.backgroundColor;


    return (
        <View style={[styles.containerMes, { marginBottom: 10 }]}>
            <Text style={styles.tituloMes}>Ingresos y Egresos por Mes</Text>
            {/* Leyenda de ingresos y egresos */}
            <View style={styles.leyendaBarras}>
                <View style={styles.itemLeyenda}>
                    <View style={[styles.indicadorColorLeyenda, styles.colorIngresosBarra]} />
                    <Text style={styles.textoLeyenda}>Ingresos</Text>
                </View>
                <View style={styles.itemLeyenda}>
                    <View style={[styles.indicadorColorLeyenda, styles.colorEgresosBarra]} />
                    <Text style={styles.textoLeyenda}>Egresos</Text>
                </View>
            </View>
            {/* Estilos de la barras */}
            <View style={styles.contenedorGraficoBarras}>
                <View style={styles.contenedorBarrasCentrado}>
                    <View style={styles.espacioBarras}>
                        <View style={[styles.tamanoBarras, { height: ingresosHeight, backgroundColor: colorIngresos }]} />
                    </View>
                    <View style={styles.espacioBarras}>
                        <View style={[styles.tamanoBarras, { height: egresosHeight, backgroundColor: colorEgresos, marginLeft: 5 }]} />
                    </View>
                </View>
                <View style={styles.lineaGrafica} />
                <Text style={styles.etiquetaMesBarra}>{mesData.mes} 2025</Text>
            </View>
        </View>
    );
};

// Grafica circular
const GraficoCategoriaMensual = ({ title, selectedMonth, data }) => {
    // MODIFICACIÓN: Extraemos los colores usando la 'colorKey' y el objeto de estilos
    // Esto asegura que el color hexadecimal venga de la zona de estilos
    const [color1, color2, color3, color4] = data.map(d => styles.COLORES_CATEGORIAS[d.colorKey]);

    return (
        <View style={[styles.containerCategoria, { marginBottom: 20 }]}>
            <Text style={styles.tituloCategoria}>{title}</Text>
            <View style={styles.encabezadoCategoria}>
                <View style={styles.botonOpcionMes}>
                    {/* Estilos movidos al objeto styles */}
                    <Text style={styles.textoMesGrafico}>{selectedMonth} 2025</Text>
                    <Text style={styles.indicadorFlecha}> ▼ </Text>
                </View>
            </View>
            
            <View style={styles.contenidoCategoria}>
                <View style={styles.contenedorGraficoPastel}>
                     <View style={[
                        styles.graficoPastelSimulado, 
                        {
                            borderColor: color1,
                            borderRightColor: color2,
                            borderBottomColor: color3,
                            borderTopColor: color4,
                        }
                     ]} />
                </View>

                <View style={styles.leyendaCategoria}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.itemLeyendaCategoria}>
                            {/* MODIFICACIÓN: Usamos la colorKey para obtener el color hex del styles */}
                            <View style={[styles.indicadorColorLeyenda, { backgroundColor: styles.COLORES_CATEGORIAS[item.colorKey], marginRight: 8 }]} />
                            
                            {/* Estilos movidos al objeto styles */}
                            <Text style={styles.textoPorcentaje}>{item.percentage}</Text>
                            <Text style={styles.textoLeyendaCategoria}>{item.name}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default function ReportesScreen() {
    
    const selectedMonthName = dataFija.mes;
    const dataForSelectedMonth = dataFija;

    return (
        <View style={styles.contenedorPrincipal}>
            <Text style={styles.tituloPrincipal}>Reportes Graficos</Text>
            
            <ScrollView contentContainerStyle={styles.contenidoScroll}>
                
                <MonthSelector /> 

                <GraficoBarrasMensual mesData={dataForSelectedMonth} />

                <GraficoCategoriaMensual 
                    title="Ingresos por Categoría" 
                    selectedMonth={selectedMonthName} 
                    data={categoriasData} 
                />

                <GraficoCategoriaMensual 
                    title="Egresos por Categoría" 
                    selectedMonth={selectedMonthName} 
                    data={categoriasData} 
                />
            </ScrollView>
        </View>
    );
}

// Zona estilos
const styles = StyleSheet.create({
    // --- COLORES DE CATEGORÍAS (MOVIDOS AQUÍ) ---
    COLORES_CATEGORIAS: {
        comida: '#5DADE2',      // Color 1: Comida
        transporte: '#EC7063',  // Color 2: Transporte
        servicios: '#F4D03F',   // Color 3: Servicios
        otros: '#4A8FE7',       // Color 4: Otros
    },

    // --- Estilos Generales ---
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: '#E3F2FD', 
    },
    contenidoScroll: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        alignItems: 'center',
        paddingBottom: 40, 
    },
    tituloPrincipal: { 
        fontSize: 30,
        fontWeight: 'bold',
        color: '#030213', 
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'center',
    },
    // Contenedores
    containerCategoria: { 
        width: screenWidth - 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        elevation: 3,
        shadowColor: '#030213', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    containerMes: { 
        width: screenWidth - 20,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        padding: 15,
        elevation: 3,
        shadowColor: '#030213',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: 20,
    },
    // Por mes
    tituloMes: { 
        fontSize: 18,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 10,
        textAlign: 'center',
    },
    tituloCategoria: { 
        fontSize: 18,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 10,
        textAlign: 'center',
    },
    selectorMes: {
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    botonMes: { 
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        marginHorizontal: 4,
        backgroundColor: '#ffffff', 
        justifyContent: 'center',
        borderWidth: 1, 
        borderColor: '#d1d1d1',
    },
    botonMesSeleccion: { 
        backgroundColor: '#4A8FE7',
        borderWidth: 1,
        borderColor: '#4A8FE7',
    },
    textoBotonMes: { 
        fontSize: 12, 
        color: '#717182',
        fontWeight: 'bold',
    },
    textoBotonMesSeleccion: { 
        color: '#ffffff',
    },
    // --- Estilos Gráfico de Barras ---
    contenedorGraficoBarras: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        marginBottom: 5,
    },
    contenedorBarrasCentrado: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 160,
        justifyContent: 'center',
        width: '100%',
        paddingBottom: 5,
    },
    espacioBarras: {
        alignItems: 'center',
        marginHorizontal: 15, 
    },
    tamanoBarras: {
        width: 40, 
        borderRadius: 2,
    },
    lineaGrafica: {
        width: '50%',
        height: 2,
        backgroundColor: '#d1d1d1', 
        marginTop: 5,
    },
    etiquetaMesBarra: {
        fontSize: 14, 
        fontWeight: 'bold',
        color: '#717182',
        marginTop: 8,
    },
    leyendaBarras: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20, 
        marginTop: 5,
    },
    // Colores de Ingresos/Egresos (Barras)
    colorIngresosBarra: {
        backgroundColor: '#EC7063', // Unificado al color de la barra original
    },
    colorEgresosBarra: {
        backgroundColor: '#5DADE2',
    },
    // Cada par (círculo + texto)
    itemLeyenda: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 15, 
    },
    // El círculo de color
    indicadorColorLeyenda: {
        width: 14, 
        height: 14,
        borderRadius: 7, 
        marginRight: 8,
    },
    // Texto de ingresos y egresos
    textoLeyenda: {
        fontSize: 16,
        color: '#333', 
        fontWeight: '500', 
    },
    // --- Estilos Gráfico de Categoría (Circular) ---
    encabezadoCategoria: {
        flexDirection: 'row',
        justifyContent: 'flex-start', 
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    botonOpcionMes: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#d1d1d1',
        borderRadius: 5,
        alignItems: 'center',
    },
    textoMesGrafico: { // Nuevo estilo para el texto del mes
        fontWeight: 'bold', 
        fontSize: 14, 
        color: '#030213',
    },
    indicadorFlecha: { // Nuevo estilo para la flecha
        fontSize: 14, 
        color: '#717182',
    },
    contenidoCategoria: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 5,
    },
    contenedorGraficoPastel: {
        width: '45%', 
        alignItems: 'center',
        justifyContent: 'center',
    },
    graficoPastelSimulado: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 15, 
    },
    leyendaCategoria: {
        width: '50%', 
        paddingLeft: 10,
    },
    itemLeyendaCategoria: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    textoPorcentaje: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 5,
        width: 35,
        textAlign: 'right',
        color: '#717182', 
    },
    textoLeyendaCategoria: {
        fontSize: 14,
        color: '#717182', 
        flex: 1,
    },
    indicadorColorLeyenda: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 5,
    },
});