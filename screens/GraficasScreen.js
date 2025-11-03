import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const meses = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
];

const dataFija = {
    mes: 'Enero', 
    ingresos: 500, 
    egresos: 240, 
};

const categoriasData = [
    { name: 'Comida', percentage: '40%', color: '#5DADE2' }, 
    { name: 'Transporte', percentage: '28%', color: '#EC7063' }, 
    { name: 'Servicios', percentage: '22%', color: '#F4D03F' }, 
    { name: 'Otros', percentage: '10%', color: '#4A8FE7' }, 
];

const MonthSelector = () => (
    <ScrollView 
        horizontal 
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

const GraficoBarrasMensual = ({ mesData }) => {
    const maxBarHeight = 150;
    const maxValGlobal = 600; 

    const ingresosHeight = (mesData.ingresos / maxValGlobal) * maxBarHeight;
    const egresosHeight = (mesData.egresos / maxValGlobal) * maxBarHeight;

    return (
        <View style={[styles.containerMes, { marginBottom: 10 }]}>
            <Text style={styles.tituloMes}>Ingresos y Egresos por Mes</Text>
            <View style={styles.contenedorGraficoBarras}>
                <View style={styles.contenedorBarrasCentrado}>
                    <View style={styles.espacioBarras}>
                        <View style={[styles.tamanoBarras, { height: ingresosHeight, backgroundColor: '#EC7063' }]} />
                    </View>
                    <View style={styles.espacioBarras}>
                        <View style={[styles.tamanoBarras, { height: egresosHeight, backgroundColor: '#5DADE2', marginLeft: 5 }]} />
                    </View>
                </View>
                <View style={styles.lineaGrafica} />
                <Text style={styles.etiquetaMesBarra}>{mesData.mes} 2025</Text>
            </View>
        </View>
    );
};

const GraficoCategoriaMensual = ({ title, selectedMonth, data }) => {
    const [color1, color2, color3, color4] = data.map(d => d.color);

    return (
        <View style={[styles.containerCategoria, { marginBottom: 20 }]}>
            <Text style={styles.tituloCategoria}>{title}</Text>
            <View style={styles.encabezadoCategoria}>
                <View style={styles.botonOpcionMes}>
                    <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{selectedMonth} 2025</Text>
                    <Text style={{ fontSize: 14, color: '#717182' }}> 🔽</Text>
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
                            <View style={[styles.indicadorColorLeyenda, { backgroundColor: item.color, marginRight: 8 }]} />
                            <Text style={[styles.textoPorcentaje, { color: '#717182' }]}>{item.percentage}</Text>
                            <Text style={[styles.textoLeyendaCategoria, { color: '#717182' }]}>{item.name}</Text>
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

const styles = StyleSheet.create({
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
        width: 1000,
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
        width: 1000,
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
    // Por categoria
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