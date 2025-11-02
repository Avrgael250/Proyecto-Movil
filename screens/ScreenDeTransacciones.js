import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { transaccionesEjemplo, categorias } from './ejemploDatos';
import ElementoTransaccion from './ElementoTransaccion';

const ScreenDeTransacciones = () => {
  // Estados principales
  const [transacciones, setTransacciones] = useState(transaccionesEjemplo);
  const [transaccionesFiltradas, setTransaccionesFiltradas] = useState(transaccionesEjemplo);
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  
  // Estados para filtros
  const [filtros, setFiltros] = useState({
    tipo: null,
    montoMinimo: '',
    montoMaximo: '',
  });

  // Estado para resumen
  const [resumen, setResumen] = useState({ 
    ingresos: 0, 
    gastos: 0, 
    balance: 0 
  });

  // Estado para formulario
  const [transaccionEditando, setTransaccionEditando] = useState(null);
  const [datosFormulario, setDatosFormulario] = useState({
    tipo: 'gasto',
    monto: '',
    categoria: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
  });

  // Calcular resumen cuando cambien las transacciones filtradas
  useEffect(() => {
    calcularResumen();
  }, [transaccionesFiltradas]);

  const calcularResumen = () => {
    const ingresos = transaccionesFiltradas
      .filter(t => t.tipo === 'ingreso')
      .reduce((suma, t) => suma + t.monto, 0);
    
    const gastos = transaccionesFiltradas
      .filter(t => t.tipo === 'gasto')
      .reduce((suma, t) => suma + t.monto, 0);
    
    setResumen({
      ingresos,
      gastos,
      balance: ingresos - gastos
    });
  };

  // --- FUNCIONES DE FILTRADO ---
  const aplicarFiltros = () => {
    let transaccionesFiltradasTemp = [...transacciones];
    
    // Filtrar por tipo (ingreso/gasto)
    if (filtros.tipo) {
      transaccionesFiltradasTemp = transaccionesFiltradasTemp.filter(
        t => t.tipo === filtros.tipo
      );
    }
    
    // Filtrar por monto mínimo
    if (filtros.montoMinimo) {
      transaccionesFiltradasTemp = transaccionesFiltradasTemp.filter(
        t => t.monto >= parseFloat(filtros.montoMinimo)
      );
    }
    
    // Filtrar por monto máximo
    if (filtros.montoMaximo) {
      transaccionesFiltradasTemp = transaccionesFiltradasTemp.filter(
        t => t.monto <= parseFloat(filtros.montoMaximo)
      );
    }
    
    setTransaccionesFiltradas(transaccionesFiltradasTemp);
    setMostrarModalFiltros(false);
  };

  const limpiarFiltros = () => {
    setFiltros({
      tipo: null,
      montoMinimo: '',
      montoMaximo: '',
    });
    setTransaccionesFiltradas(transacciones);
    setMostrarModalFiltros(false);
  };

  // --- FUNCIONES CRUD ---
  const agregarTransaccion = () => {
    setTransaccionEditando(null);
    setDatosFormulario({
      tipo: 'gasto',
      monto: '',
      categoria: 'Comida',
      descripcion: '',
      fecha: new Date().toISOString().split('T')[0],
    });
    setMostrarModalFormulario(true);
  };

  const guardarTransaccion = () => {
    // Validar campos obligatorios
    if (!datosFormulario.monto || !datosFormulario.categoria) {
      Alert.alert('Error', 'Por favor completa el monto y la categoría');
      return;
    }

    if (transaccionEditando) {
      // EDITAR transacción existente
      setTransacciones(prev => 
        prev.map(t => 
          t.id === transaccionEditando.id 
            ? { 
                ...datosFormulario, 
                id: transaccionEditando.id,
                monto: parseFloat(datosFormulario.monto)
              } 
            : t
        )
      );
    } else {
      // AGREGAR nueva transacción
      const nuevaTransaccion = {
        ...datosFormulario,
        id: Date.now().toString(),
        monto: parseFloat(datosFormulario.monto),
        fechaCreacion: new Date(),
      };
      setTransacciones(prev => [nuevaTransaccion, ...prev]);
    }

    setTransaccionesFiltradas(transacciones);
    setMostrarModalFormulario(false);
    setTransaccionEditando(null);
  };

  const editarTransaccion = (transaccion) => {
    setTransaccionEditando(transaccion);
    setDatosFormulario({
      tipo: transaccion.tipo,
      monto: transaccion.monto.toString(),
      categoria: transaccion.categoria,
      descripcion: transaccion.descripcion,
      fecha: transaccion.fecha,
    });
    setMostrarModalDetalles(false);
    setMostrarModalFormulario(true);
  };

  const eliminarTransaccion = (idTransaccion) => {
    Alert.alert(
      'Eliminar Transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setTransacciones(prev => prev.filter(t => t.id !== idTransaccion));
            setTransaccionesFiltradas(prev => prev.filter(t => t.id !== idTransaccion));
            setMostrarModalDetalles(false);
          }
        },
      ]
    );
  };

  const verDetalles = (transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setMostrarModalDetalles(true);
  };

  // --- COMPONENTES DE MODALES ---
  const ModalDetalles = () => {
    if (!mostrarModalDetalles) return null;

    return (
      <View style={estilos.fondoModal}>
        <View style={estilos.contenedorModal}>
          <View style={estilos.encabezadoModal}>
            <Text style={estilos.tituloModal}>📋 Detalles</Text>
            <TouchableOpacity onPress={() => setMostrarModalDetalles(false)}>
              <Text style={estilos.botonCerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          {transaccionSeleccionada && (
            <ScrollView style={estilos.contenidoModal}>
              <View style={estilos.tarjetaDetalles}>
                <View style={estilos.seccionIcono}>
                  <View style={[
                    estilos.contenedorIconoGrande,
                    { 
                      backgroundColor: transaccionSeleccionada.tipo === 'ingreso' 
                        ? '#E0F2FE' 
                        : '#FEE2E2' 
                    }
                  ]}>
                    <Text style={estilos.emojiGrande}>
                      {transaccionSeleccionada.tipo === 'ingreso' ? '💰' : '💸'}
                    </Text>
                  </View>
                  <Text style={estilos.textoCategoriaGrande}>
                    {transaccionSeleccionada.categoria}
                  </Text>
                  <Text style={[
                    estilos.textoMontoGrande,
                    { 
                      color: transaccionSeleccionada.tipo === 'ingreso' 
                        ? '#0EA5E9' 
                        : '#EF4444' 
                    }
                  ]}>
                    {transaccionSeleccionada.tipo === 'ingreso' ? '+' : '-'}$
                    {transaccionSeleccionada.monto}
                  </Text>
                </View>

                <View style={estilos.seccionInformacion}>
                  <View style={estilos.filaDetalle}>
                    <Text style={estilos.etiquetaDetalle}>Descripción:</Text>
                    <Text style={estilos.valorDetalle}>
                      {transaccionSeleccionada.descripcion || 'Sin descripción'}
                    </Text>
                  </View>
                  <View style={estilos.filaDetalle}>
                    <Text style={estilos.etiquetaDetalle}>Fecha:</Text>
                    <Text style={estilos.valorDetalle}>
                      {new Date(transaccionSeleccionada.fecha).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <View style={estilos.filaDetalle}>
                    <Text style={estilos.etiquetaDetalle}>Tipo:</Text>
                    <Text style={estilos.valorDetalle}>
                      {transaccionSeleccionada.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </Text>
                  </View>
                </View>

                <View style={estilos.seccionAcciones}>
                  <TouchableOpacity 
                    style={[estilos.botonAccion, estilos.botonEditar]}
                    onPress={() => editarTransaccion(transaccionSeleccionada)}
                  >
                    <Text style={estilos.textoBotonEditar}>✏️ Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[estilos.botonAccion, estilos.botonEliminar]}
                    onPress={() => eliminarTransaccion(transaccionSeleccionada.id)}
                  >
                    <Text style={estilos.textoBotonEliminar}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    );
  };

  const ModalFormulario = () => {
    if (!mostrarModalFormulario) return null;

    const categoriasFiltradas = categorias.filter(
      cat => cat.tipo === datosFormulario.tipo
    );

    return (
      <View style={estilos.fondoModal}>
        <View style={[estilos.contenedorModal, estilos.modalGrande]}>
          <View style={estilos.encabezadoModal}>
            <Text style={estilos.tituloModal}>
              {transaccionEditando ? '✏️ Editar' : '➕ Nueva'} Transacción
            </Text>
            <TouchableOpacity onPress={() => setMostrarModalFormulario(false)}>
              <Text style={estilos.botonCerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={estilos.contenidoModal}>
            {/* Selección de Tipo */}
            <View style={estilos.seccionFormulario}>
              <Text style={estilos.etiquetaFormulario}>Tipo de Transacción *</Text>
              <View style={estilos.contenedorTipos}>
                <TouchableOpacity
                  style={[
                    estilos.botonTipo,
                    datosFormulario.tipo === 'gasto' && estilos.botonTipoActivo
                  ]}
                  onPress={() => setDatosFormulario(prev => ({ ...prev, tipo: 'gasto' }))}
                >
                  <Text style={[
                    estilos.textoBotonTipo,
                    datosFormulario.tipo === 'gasto' && estilos.textoBotonTipoActivo
                  ]}>
                    💸 Gasto
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    estilos.botonTipo,
                    datosFormulario.tipo === 'ingreso' && estilos.botonTipoActivo
                  ]}
                  onPress={() => setDatosFormulario(prev => ({ ...prev, tipo: 'ingreso' }))}
                >
                  <Text style={[
                    estilos.textoBotonTipo,
                    datosFormulario.tipo === 'ingreso' && estilos.textoBotonTipoActivo
                  ]}>
                    💰 Ingreso
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo Monto */}
            <View style={estilos.seccionFormulario}>
              <Text style={estilos.etiquetaFormulario}>Monto *</Text>
              <View style={estilos.contenedorMonto}>
                <Text style={estilos.simboloMoneda}>$</Text>
                <TextInput
                  style={estilos.campoMonto}
                  placeholder="0.00"
                  value={datosFormulario.monto}
                  onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, monto: texto }))}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Campo Categoría */}
            <View style={estilos.seccionFormulario}>
              <Text style={estilos.etiquetaFormulario}>Categoría *</Text>
              <View style={estilos.contenedorCategorias}>
                {categoriasFiltradas.map((categoria) => (
                  <TouchableOpacity
                    key={categoria.id}
                    style={[
                      estilos.botonCategoria,
                      datosFormulario.categoria === categoria.nombre && 
                        estilos.botonCategoriaActivo
                    ]}
                    onPress={() => setDatosFormulario(prev => ({ 
                      ...prev, 
                      categoria: categoria.nombre 
                    }))}
                  >
                    <Text style={[
                      estilos.textoBotonCategoria,
                      datosFormulario.categoria === categoria.nombre && 
                        estilos.textoBotonCategoriaActivo
                    ]}>
                      {categoria.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Campo Descripción */}
            <View style={estilos.seccionFormulario}>
              <Text style={estilos.etiquetaFormulario}>Descripción</Text>
              <TextInput
                style={estilos.campoDescripcion}
                placeholder="Agregar una nota o descripción..."
                value={datosFormulario.descripcion}
                onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, descripcion: texto }))}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Campo Fecha */}
            <View style={estilos.seccionFormulario}>
              <Text style={estilos.etiquetaFormulario}>Fecha *</Text>
              <TextInput
                style={estilos.campoFecha}
                value={datosFormulario.fecha}
                onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, fecha: texto }))}
                placeholder="AAAA-MM-DD"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Botón Guardar */}
            <TouchableOpacity 
              style={[
                estilos.botonGuardar,
                { 
                  backgroundColor: datosFormulario.tipo === 'ingreso' 
                    ? '#0EA5E9' 
                    : '#EF4444' 
                }
              ]}
              onPress={guardarTransaccion}
            >
              <Text style={estilos.textoBotonGuardar}>
                {transaccionEditando ? '💾 Guardar Cambios' : '➕ Agregar Transacción'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  };

  const ModalFiltros = () => {
    if (!mostrarModalFiltros) return null;

    return (
      <View style={estilos.fondoModal}>
        <View style={estilos.contenedorModal}>
          <View style={estilos.encabezadoModal}>
            <Text style={estilos.tituloModal}>🔍 Filtrar Transacciones</Text>
            <TouchableOpacity onPress={() => setMostrarModalFiltros(false)}>
              <Text style={estilos.botonCerrar}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={estilos.contenidoModal}>
            {/* Filtro por Tipo */}
            <View style={estilos.seccionFiltro}>
              <Text style={estilos.tituloSeccionFiltro}>Filtrar por Tipo</Text>
              <View style={estilos.botonesTipoFiltro}>
                <TouchableOpacity
                  style={[
                    estilos.botonFiltroTipo,
                    filtros.tipo === 'ingreso' && estilos.botonFiltroTipoActivo
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, tipo: 'ingreso' }))}
                >
                  <Text style={[
                    estilos.textoBotonFiltroTipo,
                    filtros.tipo === 'ingreso' && estilos.textoBotonFiltroTipoActivo
                  ]}>
                    💰 Solo Ingresos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    estilos.botonFiltroTipo,
                    filtros.tipo === 'gasto' && estilos.botonFiltroTipoActivo
                  ]}
                  onPress={() => setFiltros(prev => ({ ...prev, tipo: 'gasto' }))}
                >
                  <Text style={[
                    estilos.textoBotonFiltroTipo,
                    filtros.tipo === 'gasto' && estilos.textoBotonFiltroTipoActivo
                  ]}>
                    💸 Solo Gastos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={estilos.botonFiltroTipo}
                  onPress={() => setFiltros(prev => ({ ...prev, tipo: null }))}
                >
                  <Text style={estilos.textoBotonFiltroTipo}>📊 Todos</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filtro por Monto */}
            <View style={estilos.seccionFiltro}>
              <Text style={estilos.tituloSeccionFiltro}>Filtrar por Monto</Text>
              <View style={estilos.filtroMonto}>
                <View style={estilos.contenedorInputMonto}>
                  <Text style={estilos.etiquetaInputMonto}>Monto Mínimo</Text>
                  <TextInput
                    style={estilos.inputMonto}
                    placeholder="0"
                    value={filtros.montoMinimo}
                    onChangeText={(texto) => setFiltros(prev => ({ ...prev, montoMinimo: texto }))}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={estilos.contenedorInputMonto}>
                  <Text style={estilos.etiquetaInputMonto}>Monto Máximo</Text>
                  <TextInput
                    style={estilos.inputMonto}
                    placeholder="1000"
                    value={filtros.montoMaximo}
                    onChangeText={(texto) => setFiltros(prev => ({ ...prev, montoMaximo: texto }))}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
            {/* Botones de Acción */}
            <View style={estilos.contenedorBotonesFiltro}>
              <TouchableOpacity 
                style={[estilos.botonFiltroAccion, estilos.botonLimpiar]}
                onPress={limpiarFiltros}
              >
                <Text style={estilos.textoBotonLimpiar}>🔄 Limpiar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[estilos.botonFiltroAccion, estilos.botonAplicar]}
                onPress={aplicarFiltros}
              >
                <Text style={estilos.textoBotonAplicar}>✅ Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  // --- COMPONENTES PRINCIPALES ---
  const Encabezado = () => (
    <View style={estilos.encabezado}>
      <Text style={estilos.tituloApp}>Ahorra+ App</Text>
      <Text style={estilos.tituloPantalla}>Mis Transacciones</Text>
      
      {/* Tarjeta de Resumen */}
      <View style={estilos.contenedorResumen}>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Ingresos</Text>
          <Text style={[estilos.valorResumen, estilos.textoIngreso]}>
            +${resumen.ingresos}
          </Text>
        </View>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Gastos</Text>
          <Text style={[estilos.valorResumen, estilos.textoGasto]}>
            -${resumen.gastos}
          </Text>
        </View>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Balance</Text>
          <Text style={[
            estilos.valorResumen,
            { color: resumen.balance >= 0 ? '#0EA5E9' : '#EF4444' }
          ]}>
            ${resumen.balance}
          </Text>
        </View>
      </View>
    </View>
  );

  const Controles = () => (
    <View style={estilos.controles}>
      <TouchableOpacity 
        style={estilos.botonFiltro}
        onPress={() => setMostrarModalFiltros(true)}
      >
        <Text style={estilos.textoBotonFiltro}>🔍 Filtrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={estilos.botonAgregar}
        onPress={agregarTransaccion}
      >
        <Text style={estilos.textoBotonAgregar}>➕ Nueva Transacción</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={estilos.contenedor}>
      <StatusBar barStyle="dark-content" />
      
      <Encabezado />
      <Controles />

      {/* Lista de Transacciones */}
      <FlatList
        data={transaccionesFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ElementoTransaccion 
            transaccion={item} 
            alPresionar={() => verDetalles(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.contenidoLista}
        ListEmptyComponent={
          <Text style={estilos.textoListaVacia}>
            No hay transacciones para mostrar
          </Text>
        }
      />

      {/* Modales */}
      <ModalDetalles />
      <ModalFormulario />
      <ModalFiltros />
    </SafeAreaView>
  );
};

// ESTILOS COMPLETOS
const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  encabezado: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tituloApp: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  tituloPantalla: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 8,
  },
  contenedorResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  itemResumen: {
    alignItems: 'center',
  },
  etiquetaResumen: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  valorResumen: {
    fontSize: 16,
    fontWeight: '700',
  },
  textoIngreso: {
    color: '#0EA5E9',
  },
  textoGasto: {
    color: '#EF4444',
  },
  controles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  botonFiltro: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  textoBotonFiltro: {
    color: '#6B7280',
    fontWeight: '500',
  },
  botonAgregar: {
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  textoBotonAgregar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  contenidoLista: {
    paddingBottom: 20,
  },
  textoListaVacia: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 50,
    fontSize: 16,
  },
  // Estilos para modales
  fondoModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  contenedorModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalGrande: {
    width: '95%',
    maxHeight: '90%',
  },
  encabezadoModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  botonCerrar: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
  },
  contenidoModal: {
    flex: 1,
  },
  // Estilos para tarjeta de detalles
  tarjetaDetalles: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  seccionIcono: {
    alignItems: 'center',
    marginBottom: 24,
  },
  contenedorIconoGrande: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emojiGrande: {
    fontSize: 32,
  },
  textoCategoriaGrande: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  textoMontoGrande: {
    fontSize: 36,
    fontWeight: '700',
  },
  seccionInformacion: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
  },
  filaDetalle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  etiquetaDetalle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  valorDetalle: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  seccionAcciones: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  botonAccion: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botonEditar: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  botonEliminar: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  textoBotonEditar: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  textoBotonEliminar: {
    color: '#EF4444',
    fontWeight: '600',
  },
  // Estilos para formulario
  seccionFormulario: {
    marginBottom: 20,
  },
  etiquetaFormulario: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  contenedorTipos: {
    flexDirection: 'row',
    gap: 12,
  },
  botonTipo: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  botonTipoActivo: {
    backgroundColor: '#F0F9FF',
  },
  textoBotonTipo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  textoBotonTipoActivo: {
    color: '#0EA5E9',
  },
  contenedorMonto: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  simboloMoneda: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  campoMonto: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  contenedorCategorias: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  botonCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  botonCategoriaActivo: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  textoBotonCategoria: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  textoBotonCategoriaActivo: {
    color: '#FFFFFF',
  },
  campoDescripcion: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  campoFecha: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  botonGuardar: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  textoBotonGuardar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos para filtros
  seccionFiltro: {
    marginBottom: 24,
  },
  tituloSeccionFiltro: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  botonesTipoFiltro: {
    gap: 8,
  },
  botonFiltroTipo: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  botonFiltroTipoActivo: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  textoBotonFiltroTipo: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  textoBotonFiltroTipoActivo: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  filtroMonto: {
    flexDirection: 'row',
    gap: 12,
  },
  contenedorInputMonto: {
    flex: 1,
  },
  etiquetaInputMonto: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  inputMonto: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  contenedorBotonesFiltro: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  botonFiltroAccion: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  botonLimpiar: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  botonAplicar: {
    backgroundColor: '#0EA5E9',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  textoBotonLimpiar: {
    color: '#6B7280',
    fontWeight: '600',
  },
  textoBotonAplicar: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ScreenDeTransacciones;