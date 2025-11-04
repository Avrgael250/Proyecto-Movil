import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';

export default function Inicio() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

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

  const irATransferencias = () => {
    navigation.navigate('Tarjetas');
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
          
          <View style={styles.cardContent}>
            {/* Información financiera - Izquierda */}
            <View style={styles.infoFinanciera}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Balance Actual</Text>
                <Text style={styles.infoValue}>$0.00</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Balance Proyectado</Text>
                <Text style={styles.infoValue}>$0.00</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Gasto Proyectado</Text>
                <Text style={styles.infoValue}>$0.00</Text>
              </View>
            </View>

            {/* Gráfico visual - Derecha */}
            <View style={styles.graficoContainer}>
              <View style={styles.grafico}>
                {/* Representación simple de gráfico de pastel */}
                <View style={styles.pieChart}>
                  <View style={[styles.pieSlice, styles.pieYellow]} />
                  <View style={[styles.pieSlice, styles.pieBlue]} />
                  <View style={[styles.pieSlice, styles.pieOrange]} />
                  <View style={[styles.pieSlice, styles.pieRed]} />
                </View>
                {/* Pequeño icono de barras encima del pastel */}
                <View style={styles.barChartIcon}>
                  <View style={[styles.bar, styles.barBlue]} />
                  <View style={[styles.bar, styles.barYellow]} />
                  <View style={[styles.bar, styles.barRed]} />
                </View>
              </View>
            </View>
          </View>

          {/* Botón "Este mes" - Sin funcionalidad */}
          <TouchableOpacity 
            style={styles.botonEsteMes}
          >
            <Text style={styles.botonEsteMesTexto}>Este mes</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Este mes */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Este mes</Text>
          
          {/* Card de gastos */}
          <View style={styles.card}>
            <View style={styles.gastoItem}>
              <View style={styles.iconoGasto}>
                <Ionicons name="storefront-outline" size={24} color="#030213" />
              </View>
              <View style={styles.gastoInfo}>
                <Text style={styles.gastoGeneral}>Gasto General: $0</Text>
                <Text style={styles.gastoPrincipales}>Gasto principales</Text>
                <Text style={styles.sinEntradas}>Sin entradas aún</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección: Próximo */}
        <View style={styles.seccion}>
          <Text style={styles.seccionTitulo}>Próximo</Text>
          
          <View style={styles.proximoContainer}>
            {/* Círculo grande azul con checkmark */}
            <View style={styles.circuloCheckmark}>
              <Ionicons name="checkmark" size={48} color="#030213" />
            </View>
            <Text style={styles.proximoTexto}>¡Todo pagado!</Text>
          </View>
        </View>

        {/* BOTÓN DE TRANSFERENCIAS ADICIONAL */}
        <TouchableOpacity 
          style={styles.botonTransferencias}
          onPress={irATransferencias}
        >
          <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
          <Text style={styles.botonTransferenciasTexto}>💳 Mis Transacciones</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Botón Flotante (FAB) - No funcional */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

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
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  // Gráfico
  graficoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  grafico: {
    width: 100,
    height: 100,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieChart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute',
  },
  pieYellow: {
    top: 0,
    left: 0,
    width: '50%',
    height: '50%',
    backgroundColor: '#F4D03F',
    borderTopLeftRadius: 40,
  },
  pieBlue: {
    top: 0,
    right: 0,
    width: '50%',
    height: '50%',
    backgroundColor: '#5DADE2',
    borderTopRightRadius: 40,
  },
  pieOrange: {
    bottom: 0,
    left: 0,
    width: '50%',
    height: '50%',
    backgroundColor: '#EC7063',
    borderBottomLeftRadius: 40,
  },
  pieRed: {
    bottom: 0,
    right: 0,
    width: '50%',
    height: '50%',
    backgroundColor: '#EC7063',
    borderBottomRightRadius: 40,
  },
  barChartIcon: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
    bottom: 8,
    width: 40,
    height: 20,
  },
  bar: {
    width: 8,
    borderRadius: 2,
  },
  barBlue: {
    height: 14,
    backgroundColor: '#5DADE2',
  },
  barYellow: {
    height: 20,
    backgroundColor: '#F4D03F',
  },
  barRed: {
    height: 12,
    backgroundColor: '#EC7063',
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gastoInfo: {
    flex: 1,
    gap: 4,
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
});