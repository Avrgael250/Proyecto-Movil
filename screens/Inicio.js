import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import BotonAgregarTransaccion from '../components/BotonAgregarTransaccion';
import {
  obtenerSesion,
  obtenerTransaccionesDelMes,
  obtenerTotalesPorMes,
  obtenerCuentasUsuario,
  obtenerResumenEgresos,
  obtenerHistorialReciente
} from '../database/database';

export default function Inicio() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Estados para datos en tiempo real
  const [usuarioEmail, setUsuarioEmail] = useState(null);
  const [balanceActual, setBalanceActual] = useState(0);
  const [balanceProyectado, setBalanceProyectado] = useState(0);
  const [gastoProyectado, setGastoProyectado] = useState(0);
  const [gastoGeneral, setGastoGeneral] = useState(0);
  const [cantidadTransacciones, setCantidadTransacciones] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [datosGrafica, setDatosGrafica] = useState([]);
  const [historialReciente, setHistorialReciente] = useState([]);
  const [datosGraficaPie, setDatosGraficaPie] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar datos desde la base de datos
  const cargarDatos = useCallback(async (mostrarRefresh = false) => {
    try {
      if (mostrarRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // Obtener sesión del usuario
      const sesion = await obtenerSesion();
      if (!sesion || !sesion.usuario_email) {
        setIsLoading(false);
        return;
      }

      const email = sesion.usuario_email;
      setUsuarioEmail(email);

      // Usar el mes actual
      const now = new Date();
      const mes = (now.getMonth() + 1).toString(); // Mes actual (1-12)
      const anio = now.getFullYear().toString();

      // 1. Obtener balance actual (suma de saldos de todas las cuentas)
      const cuentas = await obtenerCuentasUsuario(email);
      const totalBalance = cuentas.reduce((sum, cuenta) => sum + parseFloat(cuenta.saldo || 0), 0);
      setBalanceActual(totalBalance);

      // 2. Obtener totales del mes (ingresos y egresos)
      const totales = await obtenerTotalesPorMes(email, mes, anio);
      const ingresos = parseFloat(totales.ingresos || 0);
      const egresos = parseFloat(totales.egresos || 0);

      // 3. Calcular balance proyectado (balance actual + ingresos esperados - egresos esperados)
      const balanceProyectadoCalc = totalBalance + ingresos - egresos;
      setBalanceProyectado(balanceProyectadoCalc);

      // 4. Gasto proyectado del mes
      setGastoProyectado(egresos);

      // 5. Obtener transacciones del mes
      const transacciones = await obtenerTransaccionesDelMes(email, mes, anio);
      const transaccionesEgreso = transacciones.filter(t =>
        t.tipo === 'Gasto' || t.tipo === 'Pago' || t.tipo === 'Egreso'
      );

      // Total gastado este mes
      const totalGastado = transaccionesEgreso.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);
      setGastoGeneral(totalGastado);
      setCantidadTransacciones(transaccionesEgreso.length);

      // 6. Obtener datos para la gráfica de pastel (resumen por categoría)
      const resumenEgresos = await obtenerResumenEgresos(email);
      const datosGraficaFormateados = resumenEgresos.map(item => ({
        categoria: item.categoria,
        total: parseFloat(item.total || 0)
      }));
      setDatosGrafica(datosGraficaFormateados);

      // Formatear datos para PieChart con colores
      const coloresCategoria = {
        'Comida': '#F4D03F',
        'Transporte': '#5DADE2',
        'Servicios': '#EC7063',
        'Restaurantes': '#A569BD',
        'Entretenimiento': '#48C9B0',
        'Salud': '#F5B041',
        'Educación': '#D98880',
        'Ropa': '#5499C7',
        'Otros': '#85C1E9',
        'Sin categoría': '#A9CCE3',
      };

      const datosPieChart = datosGraficaFormateados
        .filter(item => item.total > 0)
        .slice(0, 5) // Mostrar top 5 categorías
        .map((item, index) => ({
          name: item.categoria,
          population: item.total,
          color: coloresCategoria[item.categoria] || '#99A3A4',
          legendFontColor: '#7F7F7F',
          legendFontSize: 12
        }));

      setDatosGraficaPie(datosPieChart);

      // 7. Obtener historial de transacciones recientes
      const historialDB = await obtenerHistorialReciente(email, 5);
      setHistorialReciente(historialDB);

    } catch (error) {
      console.error('❌ Error al cargar datos en Inicio:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      cargarDatos(); // Cargar datos cuando la pantalla está enfocada
    }

    return () => {
      showSystemBars();
    };
  }, [isFocused, cargarDatos]);

  const irATransferencias = () => {
    // Navegar a Gráficas con el tab de Historial de gasto seleccionado
    navigation.navigate('Gráficas');
  };

  const irAGraficas = () => {
    navigation.navigate('Gráficas');
  };

  const irAPresupuestos = () => {
    navigation.navigate('Presupuesto');
  };

  const irACuentas = () => {
    navigation.navigate('Cuentas');
  };

  // Handler para cuando se guarda una transacción
  const handleTransaccionGuardada = () => {
    cargarDatos(true); // Mostrar indicador de refresh
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Bar - Barra gris superior */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.topBarIcon}>
            <Ionicons name="square" size={12} color="#4A8FE7" />
          </View>
          <Text style={styles.topBarTitle}>Inicio</Text>
        </View>
        <TouchableOpacity
          style={styles.configButton}
          onPress={() => navigation.navigate('Configuracion')}
        >
          <Ionicons name="settings-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Título Principal */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Inicio</Text>
      </View>

      {/* Contenido Principal */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Card: Disponible para gastar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Disponible para gastar</Text>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4A8FE7" />
              <Text style={styles.loadingText}>Cargando datos...</Text>
            </View>
          ) : (
            <View style={styles.cardContent}>
              {/* Información financiera - Izquierda */}
              <View style={styles.infoFinanciera}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Balance Actual</Text>
                  <Text style={[styles.infoValue, balanceActual < 0 && styles.negativeValue]}>
                    ${balanceActual.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Balance Proyectado</Text>
                  <Text style={[styles.infoValue, balanceProyectado < 0 && styles.negativeValue]}>
                    ${balanceProyectado.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Gasto Proyectado</Text>
                  <Text style={styles.infoValue}>${gastoProyectado.toFixed(2)}</Text>
                </View>
              </View>

              {/* Gráfico visual - Derecha (clickeable) - GRÁFICA REAL */}
              <TouchableOpacity
                style={styles.graficoContainer}
                onPress={irAGraficas}
                activeOpacity={0.8}
              >
                <View style={styles.grafico}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#4A8FE7" />
                  ) : datosGraficaPie.length > 0 ? (
                    <PieChart
                      data={datosGraficaPie}
                      width={140}
                      height={100}
                      chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                      }}
                      accessor="population"
                      backgroundColor="transparent"
                      paddingLeft="15"
                      center={[10, 0]}
                      absolute
                      hasLegend={false}
                    />
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Ionicons name="pie-chart-outline" size={40} color="#CCC" />
                      <Text style={styles.noDataText}>Sin gastos</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Leyenda de la gráfica */}
          {!isLoading && datosGraficaPie.length > 0 && (
            <View style={styles.leyendaContainer}>
              {datosGraficaPie.slice(0, 3).map((item, index) => (
                <View key={index} style={styles.leyendaItem}>
                  <View style={[styles.leyendaColor, { backgroundColor: item.color }]} />
                  <Text style={styles.leyendaTexto} numberOfLines={1}>
                    {item.name}: ${item.population.toFixed(0)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Botón "Este mes" - Navega a Presupuestos */}
          <TouchableOpacity
            style={styles.botonEsteMes}
            onPress={irAGraficas}
          >
            <Text style={styles.botonEsteMesTexto}>Ver gráficas completas</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Este mes (Diciembre) */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Diciembre {new Date().getFullYear()}</Text>

          {/* Card de gastos con datos reales */}
          <TouchableOpacity
            style={styles.card}
            onPress={irAPresupuestos}
          >
            <View style={styles.gastoItem}>
              <View style={[styles.iconoGasto, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="wallet-outline" size={24} color="#4A8FE7" />
              </View>
              <View style={styles.gastoInfo}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4A8FE7" />
                ) : (
                  <>
                    <Text style={styles.gastoGeneral}>Gasto General: ${gastoGeneral.toFixed(2)}</Text>
                    <Text style={styles.gastoPrincipales}>Gastos del mes</Text>
                    <Text style={styles.sinEntradas}>
                      {cantidadTransacciones > 0
                        ? `${cantidadTransacciones} transacciones en diciembre`
                        : 'Sin gastos registrados aún'}
                    </Text>
                  </>
                )}
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#717182" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sección: Historial */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Historial</Text>

          {isLoading ? (
            <View style={styles.proximoContainer}>
              <ActivityIndicator size="large" color="#4A8FE7" />
            </View>
          ) : historialReciente.length > 0 ? (
            <View style={styles.card}>
              {historialReciente.map((transaccion, index) => {
                const fechaTransaccion = new Date(transaccion.fecha);
                const esIngreso = transaccion.tipo === 'Ingreso' || transaccion.tipo === 'Reembolso';
                const iconoCategoria = {
                  'Comida': 'fast-food-outline',
                  'Transporte': 'car-outline',
                  'Servicios': 'build-outline',
                  'Restaurantes': 'restaurant-outline',
                  'Entretenimiento': 'game-controller-outline',
                  'Salud': 'medical-outline',
                  'Educación': 'school-outline',
                  'Ropa': 'shirt-outline',
                  'Ingreso': 'trending-up-outline',
                  'Reembolso': 'return-down-back-outline',
                };

                return (
                  <View key={transaccion.id || index} style={[
                    styles.proximoPagoItem,
                    index === historialReciente.length - 1 && { borderBottomWidth: 0 }
                  ]}>
                    <View style={[
                      styles.iconoGasto,
                      { backgroundColor: esIngreso ? '#E8F5E9' : '#FFEBEE' }
                    ]}>
                      <Ionicons
                        name={iconoCategoria[transaccion.categoria] || iconoCategoria[transaccion.tipo] || 'cash-outline'}
                        size={24}
                        color={esIngreso ? '#4CAF50' : '#F44336'}
                      />
                    </View>
                    <View style={styles.gastoInfo}>
                      <Text style={styles.gastoGeneral}>
                        {transaccion.descripcion || transaccion.categoria || transaccion.tipo}
                      </Text>
                      <Text style={[styles.gastoPrincipales, {
                        color: esIngreso ? '#4CAF50' : '#F44336',
                        fontWeight: '600'
                      }]}>
                        {esIngreso ? '+' : '-'}${parseFloat(transaccion.monto).toFixed(2)}
                      </Text>
                      <Text style={styles.sinEntradas}>
                        {fechaTransaccion.toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.proximoContainer}>
              <View style={styles.circuloCheckmark}>
                <Ionicons name="receipt-outline" size={48} color="#717182" />
              </View>
              <Text style={styles.proximoTexto}>Sin transacciones recientes</Text>
            </View>
          )}
        </View>

        {/* BOTÓN DE HISTORIAL DE GASTOS */}
        <TouchableOpacity
          style={styles.botonTransferencias}
          onPress={irATransferencias}
        >
          <Ionicons name="bar-chart-outline" size={24} color="#FFFFFF" />
          <Text style={styles.botonTransferenciasTexto}>Ver Historial de Gastos</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botón Flotante (FAB) funcional - recarga datos al guardar */}
      <BotonAgregarTransaccion onTransaccionGuardada={handleTransaccionGuardada} />

      {/* Indicador de actualización */}
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <View style={styles.refreshBadge}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.refreshText}>Actualizando...</Text>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  // Top Bar
  topBar: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  configButton: {
    padding: 4,
  },
  topBarIcon: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#030213',
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#E3F2FD',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#030213',
  },
  // Contenido
  content: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // Card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  // Información Financiera
  infoFinanciera: {
    flex: 1,
    gap: 12,
    marginRight: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#717182',
    fontWeight: '400',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
  },
  negativeValue: {
    color: '#F44336',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#717182',
  },
  // Gráfico
  graficoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  grafico: {
    width: 140,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  noDataText: {
    fontSize: 12,
    color: '#999',
  },
  // Leyenda de la gráfica
  leyendaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
    paddingHorizontal: 8,
  },
  leyendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  leyendaColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  leyendaTexto: {
    fontSize: 12,
    color: '#717182',
    fontWeight: '500',
  },
  // Botón "Este mes" - El botón funcional del medio
  botonEsteMes: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  botonEsteMesTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A8FE7',
  },
  // Sección
  seccion: {
    marginBottom: 16,
  },
  seccionTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  // Gasto Item
  gastoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconoGasto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  gastoInfo: {
    flex: 1,
    gap: 4,
  },
  arrowContainer: {
    padding: 4,
  },
  gastoGeneral: {
    fontSize: 16,
    fontWeight: '600',
    color: '#030213',
  },
  gastoPrincipales: {
    fontSize: 14,
    color: '#717182',
    marginTop: 4,
  },
  sinEntradas: {
    fontSize: 14,
    color: '#717182',
    fontStyle: 'italic',
  },
  // Próximo
  proximoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  circuloCheckmark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  proximoTexto: {
    fontSize: 18,
    fontWeight: '600',
    color: '#030213',
  },
  proximoPagoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusBadge: {
    padding: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  // Botón Flotante (FAB)
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#4A8FE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  // Barra de Navegación Inferior
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d1d1',
  },
  navItem: {
    padding: 8,
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#030213',
    marginTop: 4,
  },
  // BOTÓN DE TRANSFERENCIAS NUEVO
  botonTransferencias: {
    backgroundColor: '#0EA5E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botonTransferenciasTexto: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Indicador de actualización
  refreshIndicator: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    zIndex: 1000,
  },
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A8FE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});