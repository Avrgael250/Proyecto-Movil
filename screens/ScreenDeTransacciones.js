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
  Modal,
  Dimensions,
} from 'react-native';
import { categorias } from './DatosEjemplo';
import ElementoTransaccion from './ElementoDeTransaccionScreen';
import {
  inicializarDB,
  obtenerTransacciones,
  guardarTransaccion as guardarTransaccionDB,
  actualizarTransaccion,
  eliminarTransaccion as eliminarTransaccionDB,
  obtenerSesion
} from '../database/database';

const { width, height } = Dimensions.get('window');

const ScreenDeTransacciones = () => {
  // Estados principales
  const [transacciones, setTransacciones] = useState([]);
  const [transaccionesFiltradas, setTransaccionesFiltradas] = useState([]);
  const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);
  const [mostrarModalFormulario, setMostrarModalFormulario] = useState(false);
  const [mostrarModalDetalles, setMostrarModalDetalles] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [usuarioEmail, setUsuarioEmail] = useState('');

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

  // Inicializar base de datos y cargar transacciones
  useEffect(() => {
    inicializarBaseDeDatos();
  }, []);

  const inicializarBaseDeDatos = async () => {
    try {
      await inicializarDB();
      await cargarUsuarioYSesion();
      await cargarTransacciones();
    } catch (error) {
      console.error('Error al inicializar la base de datos:', error);
      Alert.alert('Error', 'No se pudo conectar con la base de datos');
    }
  };

  const cargarUsuarioYSesion = async () => {
    try {
      const sesion = await obtenerSesion();
      if (sesion && sesion.usuario_email) {
        setUsuarioEmail(sesion.usuario_email);
      } else {
        setUsuarioEmail('usuario@ejemplo.com');
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
      setUsuarioEmail('usuario@ejemplo.com');
    }
  };

  const cargarTransacciones = async () => {
    try {
      if (!usuarioEmail) {
        console.log('⚠️ No hay usuario email para cargar transacciones');
        return;
      }

      console.log('🔄 Cargando transacciones para:', usuarioEmail);
      const transaccionesDB = await obtenerTransacciones(usuarioEmail);
      console.log('💰 Transacciones obtenidas:', transaccionesDB?.length || 0);

      const transaccionesFormateadas = (transaccionesDB || []).map(transaccion => ({
        id: transaccion.id.toString(),
        tipo: transaccion.tipo.toLowerCase(),
        monto: parseFloat(transaccion.monto),
        categoria: transaccion.categoria,
        descripcion: transaccion.descripcion,
        fecha: transaccion.fecha,
        fechaCreacion: transaccion.fecha_creacion
      }));

      setTransacciones(transaccionesFormateadas);
      setTransaccionesFiltradas(transaccionesFormateadas);
    } catch (error) {
      console.error('❌ Error al cargar transacciones:', error);
      Alert.alert('Error', 'No se pudieron cargar las transacciones: ' + error.message);
    }
  };

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

    if (filtros.tipo) {
      transaccionesFiltradasTemp = transaccionesFiltradasTemp.filter(
        t => t.tipo === filtros.tipo
      );
    }

    if (filtros.montoMinimo) {
      transaccionesFiltradasTemp = transaccionesFiltradasTemp.filter(
        t => t.monto >= parseFloat(filtros.montoMinimo)
      );
    }

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

  const guardarTransaccion = async () => {
    if (!datosFormulario.monto || !datosFormulario.categoria) {
      Alert.alert('Error', 'Por favor completa el monto y la categoría');
      return;
    }

    try {
      if (transaccionEditando) {
        const transaccionActualizada = {
          tipo: datosFormulario.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
          monto: parseFloat(datosFormulario.monto),
          categoria: datosFormulario.categoria,
          descripcion: datosFormulario.descripcion,
          fecha: datosFormulario.fecha,
          fecha_transaccion: datosFormulario.fecha
        };

        const resultado = await actualizarTransaccion(transaccionEditando.id, transaccionActualizada);

        if (resultado.success) {
          await cargarTransacciones();
          Alert.alert('Éxito', 'Transacción actualizada correctamente');
        } else {
          throw new Error('Error al actualizar');
        }
      } else {
        const nuevaTransaccion = {
          tipo: datosFormulario.tipo === 'ingreso' ? 'Ingreso' : 'Egreso',
          monto: parseFloat(datosFormulario.monto),
          categoria: datosFormulario.categoria,
          descripcion: datosFormulario.descripcion,
          fecha_transaccion: datosFormulario.fecha,
          fecha: datosFormulario.fecha
        };

        const resultado = await guardarTransaccionDB(nuevaTransaccion, usuarioEmail);

        if (resultado.success) {
          await cargarTransacciones();
          Alert.alert('Éxito', 'Transacción guardada correctamente');
        } else {
          throw new Error('Error al guardar');
        }
      }

      setMostrarModalFormulario(false);
      setTransaccionEditando(null);
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      Alert.alert('Error', 'No se pudo guardar la transacción');
    }
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

  const eliminarTransaccion = async (idTransaccion) => {
    Alert.alert(
      'Eliminar Transacción',
      '¿Estás seguro de que quieres eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const resultado = await eliminarTransaccionDB(idTransaccion);
              if (resultado.success) {
                await cargarTransacciones();
                Alert.alert('Éxito', 'Transacción eliminada correctamente');
              } else {
                throw new Error('Error al eliminar');
              }
            } catch (error) {
              console.error('Error al eliminar transacción:', error);
              Alert.alert('Error', 'No se pudo eliminar la transacción');
            }
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

  // --- COMPONENTES PRINCIPALES ---
  const Encabezado = () => (
    <View style={estilos.encabezado}>
      <Text style={estilos.tituloApp}>Ahorra+ App</Text>
      <Text style={estilos.tituloPantalla}>Mis Transacciones</Text>

      <View style={estilos.contenedorResumen}>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Ingresos</Text>
          <Text style={[estilos.valorResumen, estilos.textoIngreso]}>
            +${resumen.ingresos.toFixed(2)}
          </Text>
        </View>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Gastos</Text>
          <Text style={[estilos.valorResumen, estilos.textoGasto]}>
            -${resumen.gastos.toFixed(2)}
          </Text>
        </View>
        <View style={estilos.itemResumen}>
          <Text style={estilos.etiquetaResumen}>Balance</Text>
          <Text style={[
            estilos.valorResumen,
            { color: resumen.balance >= 0 ? '#0EA5E9' : '#EF4444' }
          ]}>
            ${resumen.balance.toFixed(2)}
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
    <SafeAreaView style={estilos.contenedorSafeArea}>
      <View style={estilos.contenedor}>
        <StatusBar barStyle="dark-content" />

        <Encabezado />
        <Controles />

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

        {/* MODAL DETALLES - CORREGIDO */}
        <Modal
          visible={mostrarModalDetalles}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setMostrarModalDetalles(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={estilos.modalContainer}>
              <View style={estilos.modalHeader}>
                <Text style={estilos.modalTitle}>📋 Detalles</Text>
                <TouchableOpacity
                  onPress={() => setMostrarModalDetalles(false)}
                  style={estilos.closeButton}
                >
                  <Text style={estilos.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={estilos.modalContent}>
                {transaccionSeleccionada && (
                  <View style={estilos.detailCard}>
                    <View style={estilos.detailIconSection}>
                      <View style={[
                        estilos.detailIconContainer,
                        {
                          backgroundColor: transaccionSeleccionada.tipo === 'ingreso'
                            ? '#E0F2FE'
                            : '#FEE2E2'
                        }
                      ]}>
                        <Text style={estilos.detailIcon}>
                          {transaccionSeleccionada.tipo === 'ingreso' ? '💰' : '💸'}
                        </Text>
                      </View>
                      <Text style={estilos.detailCategory}>
                        {transaccionSeleccionada.categoria}
                      </Text>
                      <Text style={[
                        estilos.detailAmount,
                        {
                          color: transaccionSeleccionada.tipo === 'ingreso'
                            ? '#0EA5E9'
                            : '#EF4444'
                        }
                      ]}>
                        {transaccionSeleccionada.tipo === 'ingreso' ? '+' : '-'}${transaccionSeleccionada.monto.toFixed(2)}
                      </Text>
                    </View>

                    <View style={estilos.detailInfo}>
                      <View style={estilos.detailRow}>
                        <Text style={estilos.detailLabel}>Descripción:</Text>
                        <Text style={estilos.detailValue}>
                          {transaccionSeleccionada.descripcion || 'Sin descripción'}
                        </Text>
                      </View>
                      <View style={estilos.detailRow}>
                        <Text style={estilos.detailLabel}>Fecha:</Text>
                        <Text style={estilos.detailValue}>
                          {new Date(transaccionSeleccionada.fecha).toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                      <View style={estilos.detailRow}>
                        <Text style={estilos.detailLabel}>Tipo:</Text>
                        <Text style={estilos.detailValue}>
                          {transaccionSeleccionada.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </Text>
                      </View>
                    </View>

                    <View style={estilos.detailActions}>
                      <TouchableOpacity
                        style={[estilos.actionButton, estilos.editButton]}
                        onPress={() => editarTransaccion(transaccionSeleccionada)}
                      >
                        <Text style={estilos.editButtonText}>✏️ Editar</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[estilos.actionButton, estilos.deleteButton]}
                        onPress={() => eliminarTransaccion(transaccionSeleccionada.id)}
                      >
                        <Text style={estilos.deleteButtonText}>🗑️ Eliminar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL FORMULARIO - CORREGIDO */}
        <Modal
          visible={mostrarModalFormulario}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setMostrarModalFormulario(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={[estilos.modalContainer, estilos.largeModal]}>
              <View style={estilos.modalHeader}>
                <Text style={estilos.modalTitle}>
                  {transaccionEditando ? '✏️ Editar' : '➕ Nueva'} Transacción
                </Text>
                <TouchableOpacity
                  onPress={() => setMostrarModalFormulario(false)}
                  style={estilos.closeButton}
                >
                  <Text style={estilos.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={estilos.modalContent}>
                <View style={estilos.formSection}>
                  <Text style={estilos.formLabel}>Tipo de Transacción *</Text>
                  <View style={estilos.typeButtons}>
                    <TouchableOpacity
                      style={[
                        estilos.typeButton,
                        datosFormulario.tipo === 'gasto' && estilos.typeButtonActive
                      ]}
                      onPress={() => setDatosFormulario(prev => ({ ...prev, tipo: 'gasto' }))}
                    >
                      <Text style={[
                        estilos.typeButtonText,
                        datosFormulario.tipo === 'gasto' && estilos.typeButtonTextActive
                      ]}>
                        💸 Gasto
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        estilos.typeButton,
                        datosFormulario.tipo === 'ingreso' && estilos.typeButtonActive
                      ]}
                      onPress={() => setDatosFormulario(prev => ({ ...prev, tipo: 'ingreso' }))}
                    >
                      <Text style={[
                        estilos.typeButtonText,
                        datosFormulario.tipo === 'ingreso' && estilos.typeButtonTextActive
                      ]}>
                        💰 Ingreso
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={estilos.formSection}>
                  <Text style={estilos.formLabel}>Monto *</Text>
                  <View style={estilos.amountContainer}>
                    <Text style={estilos.currencySymbol}>$</Text>
                    <TextInput
                      style={estilos.amountInput}
                      placeholder="0.00"
                      value={datosFormulario.monto}
                      onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, monto: texto }))}
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={estilos.formSection}>
                  <Text style={estilos.formLabel}>Categoría *</Text>
                  <View style={estilos.categoryButtons}>
                    {categorias.filter(cat => cat.tipo === datosFormulario.tipo).map((categoria) => (
                      <TouchableOpacity
                        key={categoria.id}
                        style={[
                          estilos.categoryButton,
                          datosFormulario.categoria === categoria.nombre && estilos.categoryButtonActive
                        ]}
                        onPress={() => setDatosFormulario(prev => ({
                          ...prev,
                          categoria: categoria.nombre
                        }))}
                      >
                        <Text style={[
                          estilos.categoryButtonText,
                          datosFormulario.categoria === categoria.nombre && estilos.categoryButtonTextActive
                        ]}>
                          {categoria.nombre}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={estilos.formSection}>
                  <Text style={estilos.formLabel}>Descripción</Text>
                  <TextInput
                    style={estilos.descriptionInput}
                    placeholder="Agregar una nota o descripción..."
                    value={datosFormulario.descripcion}
                    onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, descripcion: texto }))}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={estilos.formSection}>
                  <Text style={estilos.formLabel}>Fecha *</Text>
                  <TextInput
                    style={estilos.dateInput}
                    value={datosFormulario.fecha}
                    onChangeText={(texto) => setDatosFormulario(prev => ({ ...prev, fecha: texto }))}
                    placeholder="AAAA-MM-DD"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <TouchableOpacity
                  style={[
                    estilos.saveButton,
                    {
                      backgroundColor: datosFormulario.tipo === 'ingreso'
                        ? '#0EA5E9'
                        : '#EF4444'
                    }
                  ]}
                  onPress={guardarTransaccion}
                >
                  <Text style={estilos.saveButtonText}>
                    {transaccionEditando ? '💾 Guardar Cambios' : '➕ Agregar Transacción'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* MODAL FILTROS - CORREGIDO */}
        <Modal
          visible={mostrarModalFiltros}
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          onRequestClose={() => setMostrarModalFiltros(false)}
        >
          <View style={estilos.modalOverlay}>
            <View style={estilos.modalContainer}>
              <View style={estilos.modalHeader}>
                <Text style={estilos.modalTitle}>🔍 Filtrar Transacciones</Text>
                <TouchableOpacity
                  onPress={() => setMostrarModalFiltros(false)}
                  style={estilos.closeButton}
                >
                  <Text style={estilos.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={estilos.modalContent}>
                <View style={estilos.filterSection}>
                  <Text style={estilos.filterTitle}>Filtrar por Tipo</Text>
                  <View style={estilos.filterTypeButtons}>
                    <TouchableOpacity
                      style={[
                        estilos.filterTypeButton,
                        filtros.tipo === 'ingreso' && estilos.filterTypeButtonActive
                      ]}
                      onPress={() => setFiltros(prev => ({ ...prev, tipo: 'ingreso' }))}
                    >
                      <Text style={[
                        estilos.filterTypeButtonText,
                        filtros.tipo === 'ingreso' && estilos.filterTypeButtonTextActive
                      ]}>
                        💰 Solo Ingresos
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        estilos.filterTypeButton,
                        filtros.tipo === 'gasto' && estilos.filterTypeButtonActive
                      ]}
                      onPress={() => setFiltros(prev => ({ ...prev, tipo: 'gasto' }))}
                    >
                      <Text style={[
                        estilos.filterTypeButtonText,
                        filtros.tipo === 'gasto' && estilos.filterTypeButtonTextActive
                      ]}>
                        💸 Solo Gastos
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={estilos.filterTypeButton}
                      onPress={() => setFiltros(prev => ({ ...prev, tipo: null }))}
                    >
                      <Text style={estilos.filterTypeButtonText}>📊 Todos</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={estilos.filterSection}>
                  <Text style={estilos.filterTitle}>Filtrar por Monto</Text>
                  <View style={estilos.amountFilter}>
                    <View style={estilos.amountInputContainer}>
                      <Text style={estilos.amountInputLabel}>Monto Mínimo</Text>
                      <TextInput
                        style={estilos.amountFilterInput}
                        placeholder="0"
                        value={filtros.montoMinimo}
                        onChangeText={(texto) => setFiltros(prev => ({ ...prev, montoMinimo: texto }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    <View style={estilos.amountInputContainer}>
                      <Text style={estilos.amountInputLabel}>Monto Máximo</Text>
                      <TextInput
                        style={estilos.amountFilterInput}
                        placeholder="1000"
                        value={filtros.montoMaximo}
                        onChangeText={(texto) => setFiltros(prev => ({ ...prev, montoMaximo: texto }))}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>

                <View style={estilos.filterActions}>
                  <TouchableOpacity
                    style={[estilos.filterActionButton, estilos.clearButton]}
                    onPress={limpiarFiltros}
                  >
                    <Text style={estilos.clearButtonText}>🔄 Limpiar Filtros</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[estilos.filterActionButton, estilos.applyButton]}
                    onPress={aplicarFiltros}
                  >
                    <Text style={estilos.applyButtonText}>✅ Aplicar Filtros</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

// ESTILOS CORREGIDOS
const estilos = StyleSheet.create({
  contenedorSafeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
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

  // ESTILOS DE MODALES CORREGIDOS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  largeModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Estilos para modal de detalles
  detailCard: {
    backgroundColor: '#FFFFFF',
  },
  detailIconSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  detailIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    fontSize: 32,
  },
  detailCategory: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  detailAmount: {
    fontSize: 36,
    fontWeight: '700',
  },
  detailInfo: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  detailActions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  editButtonText: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '600',
  },

  // Estilos para formulario
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#F0F9FF',
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeButtonTextActive: {
    color: '#0EA5E9',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryButtonActive: {
    backgroundColor: '#0EA5E9',
    borderColor: '#0EA5E9',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Estilos para filtros
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  filterTypeButtons: {
    gap: 8,
  },
  filterTypeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterTypeButtonActive: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  filterTypeButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTypeButtonTextActive: {
    color: '#0EA5E9',
    fontWeight: '600',
  },
  amountFilter: {
    flexDirection: 'row',
    gap: 12,
  },
  amountInputContainer: {
    flex: 1,
  },
  amountInputLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  amountFilterInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  filterActionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#6B7280',
  },
  applyButton: {
    backgroundColor: '#0EA5E9',
    borderWidth: 2,
    borderColor: '#0EA5E9',
  },
  clearButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ScreenDeTransacciones;