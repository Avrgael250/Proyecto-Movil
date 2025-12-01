import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import {
    guardarTransaccion,
    obtenerSesion,
    obtenerCuentasUsuario,
    obtenerCategorias,
    verificarPresupuestoExcedido,
    realizarTransferencia
} from '../database/database';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
// NUEVA LISTA DE CATEGORÍAS SIMPLIFICADAS
const CATEGORIAS_LISTA = ['Comida', 'Transporte', 'Servicios', 'Otros'];

const BotonAgregarTransaccion = ({ onTransaccionGuardada }) => {
    // Hook de navegación para poder navegar a otras pantallas
    const navigation = useNavigation();

    // Modal de selección de tipo
    const [modalTipos, setModalTipos] = useState(false);

    // Modal de agregar transacción
    const [modalAgregar, setModalAgregar] = useState(false);
    const [tipoTransaccion, setTipoTransaccion] = useState('');

    // NUEVO: Modal de selección de categorías
    const [modalCategorias, setModalCategorias] = useState(false);

    // NUEVO: Modal de selección de cuentas
    const [modalCuentas, setModalCuentas] = useState(false);

    // NUEVO: Para transferencias - cuenta destino
    const [modalCuentasDestino, setModalCuentasDestino] = useState(false);
    const [cuentaDestino, setCuentaDestino] = useState('');

    // Campos del formulario
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaTransaccion, setFechaTransaccion] = useState(new Date());
    const [cuenta, setCuenta] = useState('');
    const [categoria, setCategoria] = useState('');
    const [notas, setNotas] = useState('');

    // DatePicker
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

    // Datos del usuario
    const [usuarioEmail, setUsuarioEmail] = useState('');
    const [cuentas, setCuentas] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Animación para arrastrar modal
    const translateY = useState(new Animated.Value(0))[0];

    useEffect(() => {
        cargarDatosIniciales();
    }, []);

    const cargarDatosIniciales = async () => {
        try {
            const sesion = await obtenerSesion();
            if (sesion) {
                // CORRECCIÓN: Se usa 'usuario_email' en la DB, no 'email'
                setUsuarioEmail(sesion.usuario_email);
                const cuentasDb = await obtenerCuentasUsuario(sesion.usuario_email);
                const categoriasDb = await obtenerCategorias();
                setCuentas(cuentasDb || []);
                setCategorias(categoriasDb || []);
            }
        } catch (error) {
            console.error('❌ Error al cargar datos iniciales:', error);
        }
    };

    const abrirModalTipos = () => {
        translateY.setValue(0);
        setModalTipos(true);
    };

    const cerrarModalTipos = () => {
        Animated.timing(translateY, {
            toValue: 600,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setModalTipos(false);
            translateY.setValue(0);
        });
    };

    // PanResponder para detectar arrastre
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return gestureState.dy > 5;
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 150) {
                cerrarModalTipos();
            } else {
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const seleccionarTipo = (tipo) => {
        setTipoTransaccion(tipo);
        setModalTipos(false);
        resetearFormulario();
        setModalAgregar(true);
    };

    // NUEVOS HANDLERS PARA CATEGORÍA
    const abrirModalCategorias = () => {
        setModalCategorias(true);
    };

    const cerrarModalCategorias = () => {
        setModalCategorias(false);
    };

    const seleccionarCategoria = (cat) => {
        setCategoria(cat);
        cerrarModalCategorias();
    };

    // NUEVOS HANDLERS PARA CUENTA
    const abrirModalCuentas = async () => {
        // Recargar cuentas cada vez que se abre el modal
        try {
            const sesion = await obtenerSesion();
            if (sesion) {
                const cuentasDb = await obtenerCuentasUsuario(sesion.usuario_email);
                setCuentas(cuentasDb || []);
            }
        } catch (error) {
            console.error('Error al recargar cuentas:', error);
        }
        setModalCuentas(true);
    };

    const cerrarModalCuentas = () => {
        setModalCuentas(false);
    };

    const seleccionarCuenta = (cuentaNombre) => {
        setCuenta(cuentaNombre);
        cerrarModalCuentas();
    };

    // NUEVOS HANDLERS PARA CUENTA DESTINO (Transferencias)
    const abrirModalCuentasDestino = async () => {
        try {
            const sesion = await obtenerSesion();
            if (sesion) {
                const cuentasDb = await obtenerCuentasUsuario(sesion.usuario_email);
                setCuentas(cuentasDb || []);
            }
        } catch (error) {
            console.error('Error al recargar cuentas:', error);
        }
        setModalCuentasDestino(true);
    };

    const cerrarModalCuentasDestino = () => {
        setModalCuentasDestino(false);
    };

    const seleccionarCuentaDestino = (cuentaNombre) => {
        setCuentaDestino(cuentaNombre);
        cerrarModalCuentasDestino();
    };
    // FIN NUEVOS HANDLERS

    const resetearFormulario = () => {
        setMonto('');
        setDescripcion('');
        setFechaTransaccion(new Date());
        setCuenta('');
        setCategoria('');
        setNotas('');
        setCuentaDestino(''); // Resetear cuenta destino para transferencias
    };

    const onChangeFecha = (event, selectedDate) => {
        setMostrarDatePicker(false);
        if (selectedDate) {
            setFechaTransaccion(selectedDate);
        }
    };

    const guardarNuevaTransaccion = async () => {
        if (!usuarioEmail) {
            Alert.alert('Error', 'Debes iniciar sesión para registrar una transacción.');
            return;
        }

        if (!monto || parseFloat(monto) <= 0) {
            Alert.alert('Error', 'Ingresa un monto válido');
            return;
        }

        if (!descripcion.trim()) {
            Alert.alert('Error', 'Ingresa una descripción');
            return;
        }

        // Validaciones especiales para transferencias
        if (tipoTransaccion === 'Transferencia') {
            if (!cuenta) {
                Alert.alert('Error', 'Selecciona la cuenta origen');
                return;
            }
            if (!cuentaDestino) {
                Alert.alert('Error', 'Selecciona la cuenta destino');
                return;
            }
            if (cuenta === cuentaDestino) {
                Alert.alert('Error', 'La cuenta origen y destino deben ser diferentes');
                return;
            }

            // Realizar la transferencia
            try {
                const transferencia = {
                    monto: parseFloat(monto),
                    cuentaOrigen: cuenta,
                    cuentaDestino: cuentaDestino,
                    descripcion: descripcion,
                    fecha_transaccion: fechaTransaccion.toISOString().split('T')[0],
                    notas: notas
                };

                const resultado = await realizarTransferencia(transferencia, usuarioEmail);

                if (resultado.success) {
                    Alert.alert(
                        '✅ Transferencia Exitosa',
                        `Se transfirieron $${parseFloat(monto).toFixed(2)} de ${cuenta} a ${cuentaDestino}\n\n` +
                        `💳 ${cuenta}: $${resultado.saldoOrigen.toFixed(2)}\n` +
                        `💳 ${cuentaDestino}: $${resultado.saldoDestino.toFixed(2)}`
                    );
                    setModalAgregar(false);
                    resetearFormulario();

                    if (onTransaccionGuardada) {
                        onTransaccionGuardada();
                    }
                } else {
                    Alert.alert('Error', resultado.error || 'No se pudo realizar la transferencia');
                }
            } catch (error) {
                Alert.alert('Error', 'No se pudo realizar la transferencia: ' + error.message);
            }
            return; // Salir aquí para transferencias
        }

        // Para otros tipos de transacción (no transferencia)
        if (!cuenta) {
            Alert.alert('Error', 'Selecciona una cuenta');
            return;
        }

        // Determinar el tipo correcto según la selección
        let tipoFinal = tipoTransaccion;

        // Mapear tipos de transacción - mantener tipos específicos
        // Gasto y Pago se guardan como están (son egresos)
        // Ingreso y Reembolso se guardan como están (son ingresos)
        // El tipo se mantiene para poder distinguirlos en la UI

        const nuevaTransaccion = {
            tipo: tipoFinal,
            monto: parseFloat(monto),
            descripcion: descripcion,
            fecha_transaccion: fechaTransaccion.toISOString().split('T')[0],
            fecha_pago: fechaTransaccion.toISOString().split('T')[0],
            cuenta: cuenta,
            categoria: categoria || 'Otros',
            notas: notas
        };

        try {
            // Guardar transacción Y actualizar saldo de cuenta automáticamente
            const resultado = await guardarTransaccion(nuevaTransaccion, usuarioEmail);

            if (resultado.success) {
                // Verificar si se excedió el presupuesto (solo para gastos y pagos)
                if (tipoTransaccion === 'Gasto' || tipoTransaccion === 'Pago') {
                    const categoriaUsada = categoria || 'Otros';
                    const mesActual = (fechaTransaccion.getMonth() + 1).toString();
                    const anioActual = fechaTransaccion.getFullYear().toString();

                    try {
                        const verificacion = await verificarPresupuestoExcedido(
                            usuarioEmail,
                            categoriaUsada,
                            mesActual,
                            anioActual
                        );

                        if (verificacion.excedido) {
                            // Mostrar alerta de presupuesto excedido
                            setTimeout(() => {
                                Alert.alert(
                                    '⚠️ ¡Presupuesto Excedido!',
                                    `Has superado el límite de ${categoriaUsada}.\n\n` +
                                    `💰 Límite: $${verificacion.limite.toFixed(2)}\n` +
                                    `💸 Gastado: $${verificacion.gastado.toFixed(2)}\n` +
                                    `📊 Excedido por: $${verificacion.diferencia.toFixed(2)}`,
                                    [
                                        {
                                            text: 'Entendido',
                                            style: 'cancel'
                                        },
                                        {
                                            text: 'Ver Presupuestos',
                                            onPress: () => {
                                                // Navegar a la pantalla de Presupuestos
                                                navigation.navigate('PresupuestosMensuales');
                                            }
                                        }
                                    ],
                                    { cancelable: true }
                                );
                            }, 500); // Pequeño delay para que no se solapen las alertas
                        }
                    } catch (error) {
                        // Error silencioso al verificar presupuesto
                    }
                }

                // Mensaje personalizado según tipo
                let mensaje = '';
                switch (tipoTransaccion) {
                    case 'Gasto':
                        mensaje = `💸 Gasto de $${monto} registrado y descontado de ${cuenta}`;
                        break;
                    case 'Pago':
                        mensaje = `💳 Pago de $${monto} registrado y descontado de ${cuenta}`;
                        break;
                    case 'Ingreso':
                        mensaje = `💰 Ingreso de $${monto} registrado y sumado a ${cuenta}`;
                        break;
                    case 'Transferencia':
                        mensaje = `🔄 Transferencia de $${monto} registrada`;
                        break;
                    case 'Reembolso':
                        mensaje = `↩️ Reembolso de $${monto} registrado y sumado a ${cuenta}`;
                        break;
                    default:
                        mensaje = '✅ Transacción guardada correctamente';
                }

                Alert.alert('Éxito', mensaje);
                setModalAgregar(false);
                resetearFormulario();

                // Notificar al componente padre que se guardó una transacción
                if (onTransaccionGuardada) {
                    onTransaccionGuardada();
                }
            } else {
                console.error('❌ Error al guardar:', resultado.error);
                Alert.alert('Error', resultado.error || 'No se pudo guardar la transacción');
            }
        } catch (error) {
            console.error('❌ Error en guardarNuevaTransaccion:', error);
            Alert.alert('Error', 'No se pudo guardar la transacción: ' + error.message);
        }
    };

    const obtenerTituloModal = () => {
        switch (tipoTransaccion) {
            case 'Gasto':
                return 'Agregar Gasto';
            case 'Pago':
                return 'Agregar Pago';
            case 'Ingreso':
                return 'Agregar Ingreso';
            case 'Transferencia':
                return 'Agregar Transferencia';
            case 'Reembolso':
                return 'Agregar Reembolso';
            default:
                return 'Agregar Transacción';
        }
    };

    return (
        <>
            {/* Botón Flotante (FAB) */}
            <TouchableOpacity style={styles.fab} onPress={abrirModalTipos}>
                <Ionicons name="add" size={28} color="#ffffff" />
            </TouchableOpacity>

            {/* Modal de Selección de Tipos */}
            <Modal
                visible={modalTipos}
                animationType="slide"
                transparent={true}
                onRequestClose={cerrarModalTipos}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={cerrarModalTipos}
                >
                    <Animated.View
                        style={[
                            styles.modalTiposContainer,
                            {
                                transform: [{ translateY: translateY }]
                            }
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTiposTitulo}>Agregar transacción</Text>

                            {/* Gasto */}
                            <TouchableOpacity
                                style={styles.tipoItem}
                                onPress={() => seleccionarTipo('Gasto')}
                            >
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="receipt-outline" size={24} color="#000" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={styles.tipoTitulo}>Gasto</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra una compra o un pago que hiciste, como supermercado, gasolina o restaurantes.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separador} />

                            {/* Pago */}
                            <TouchableOpacity
                                style={styles.tipoItem}
                                onPress={() => seleccionarTipo('Pago')}
                            >
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="card-outline" size={24} color="#000" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={styles.tipoTitulo}>Pago</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra un pago que necesites hacer, como suscripciones, renta o servicios.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separador} />

                            {/* Ingreso */}
                            <TouchableOpacity
                                style={styles.tipoItem}
                                onPress={() => seleccionarTipo('Ingreso')}
                            >
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="cash-outline" size={24} color="#000" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={styles.tipoTitulo}>Ingreso</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra tu salario, bonos, freelance u otro ingreso que recibas.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separador} />

                            {/* Transferencia */}
                            <TouchableOpacity
                                style={styles.tipoItem}
                                onPress={() => seleccionarTipo('Transferencia')}
                            >
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="swap-horizontal-outline" size={24} color="#000" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={styles.tipoTitulo}>Transferencia</Text>
                                    {/* CORRECCIÓN DE SINTAXIS EN EL TEXTO */}
                                    <Text style={styles.tipoDescripcion}>
                                        Registra movimientos entre cuentas, como transferencia de cuenta de cheques a ahorro.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separador} />

                            {/* Reembolso */}
                            <TouchableOpacity
                                style={styles.tipoItem}
                                onPress={() => seleccionarTipo('Reembolso')}
                            >
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="return-up-back-outline" size={24} color="#000" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={styles.tipoTitulo}>Reembolso</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra un reembolso que recibiste, como al devolver un producto.
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            <View style={styles.separador} />

                            {/* Compra a meses - PREMIUM */}
                            <View style={styles.tipoItemDisabled}>
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="calendar-outline" size={24} color="#999" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={[styles.tipoTitulo, { color: '#999' }]}>Compra a meses</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra una compra a meses con tarjeta de crédito.
                                    </Text>
                                </View>
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumText}>PREMIUM</Text>
                                </View>
                            </View>

                            <View style={styles.separador} />

                            {/* Pago de Tarjeta - PREMIUM */}
                            <View style={styles.tipoItemDisabled}>
                                <View style={styles.tipoIcono}>
                                    <Ionicons name="card" size={24} color="#999" />
                                </View>
                                <View style={styles.tipoTextos}>
                                    <Text style={[styles.tipoTitulo, { color: '#999' }]}>Pago de Tarjeta</Text>
                                    <Text style={styles.tipoDescripcion}>
                                        Registra un pago realizado a tu tarjeta de crédito.
                                    </Text>
                                </View>
                                <View style={styles.premiumBadge}>
                                    <Text style={styles.premiumText}>PREMIUM</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de Agregar Transacción */}
            <Modal
                visible={modalAgregar}
                animationType="slide"
                transparent={false}
            >
                <View style={styles.modalAgregarContainer}>
                    <View style={styles.modalAgregarHeader}>
                        <TouchableOpacity onPress={() => setModalAgregar(false)}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                        <Text style={styles.modalAgregarTitulo}>{obtenerTituloModal()}</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView style={styles.modalAgregarContenido}>
                        {/* Info banner según tipo */}
                        <View style={styles.infoBanner}>
                            {tipoTransaccion === 'Gasto' && (
                                <>
                                    <Ionicons name="trending-down" size={20} color="#EF4444" />
                                    <Text style={styles.infoBannerTexto}>
                                        Este monto se descontará del saldo de tu cuenta
                                    </Text>
                                </>
                            )}
                            {tipoTransaccion === 'Pago' && (
                                <>
                                    <Ionicons name="card-outline" size={20} color="#EF4444" />
                                    <Text style={styles.infoBannerTexto}>
                                        Este pago se descontará del saldo de tu cuenta
                                    </Text>
                                </>
                            )}
                            {tipoTransaccion === 'Ingreso' && (
                                <>
                                    <Ionicons name="trending-up" size={20} color="#10B981" />
                                    <Text style={styles.infoBannerTexto}>
                                        Este monto se sumará al saldo de tu cuenta
                                    </Text>
                                </>
                            )}
                            {tipoTransaccion === 'Transferencia' && (
                                <>
                                    <Ionicons name="swap-horizontal" size={20} color="#3B82F6" />
                                    <Text style={styles.infoBannerTexto}>
                                        Mueve dinero entre tus cuentas
                                    </Text>
                                </>
                            )}
                            {tipoTransaccion === 'Reembolso' && (
                                <>
                                    <Ionicons name="arrow-undo" size={20} color="#10B981" />
                                    <Text style={styles.infoBannerTexto}>
                                        Este reembolso se sumará al saldo de tu cuenta
                                    </Text>
                                </>
                            )}
                        </View>

                        {/* Monto */}
                        <View style={styles.montoSection}>
                            <Text style={styles.montoLabel}>Monto</Text>
                            <View style={styles.montoContainer}>
                                <TextInput
                                    style={styles.montoInput}
                                    value={monto}
                                    onChangeText={setMonto}
                                    keyboardType="numeric"
                                    placeholder="$0.00"
                                    placeholderTextColor="#CCC"
                                />
                            </View>
                        </View>

                        {/* Descripción */}
                        <View style={styles.campoSection}>
                            <Text style={styles.campoLabel}>Descripción</Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="document-text-outline" size={20} color="#666" />
                                <TextInput
                                    style={styles.campoInput}
                                    value={descripcion}
                                    onChangeText={setDescripcion}
                                    placeholder="Escribe una descripción"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.separadorCampo} />

                        {/* Fecha de Transacción */}
                        <TouchableOpacity
                            style={styles.campoSection}
                            onPress={() => setMostrarDatePicker(true)}
                        >
                            <Text style={styles.campoLabel}>Fecha de Transaccion</Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="calendar-outline" size={20} color="#666" />
                                <Text style={styles.campoTexto}>
                                    {fechaTransaccion.getDate()} {MESES[fechaTransaccion.getMonth()].toLowerCase()} {fechaTransaccion.getFullYear()}
                                </Text>
                                <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.separadorCampo} />

                        {/* Cuenta Origen - Para transferencias muestra "Cuenta Origen" */}
                        <TouchableOpacity
                            style={styles.campoSection}
                            onPress={abrirModalCuentas}
                        >
                            <Text style={styles.campoLabel}>
                                {tipoTransaccion === 'Transferencia' ? 'Cuenta Origen' : 'Cuenta'}
                            </Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="wallet-outline" size={20} color="#666" />
                                <Text style={styles.campoTexto}>
                                    {cuenta || (tipoTransaccion === 'Transferencia' ? 'Selecciona cuenta origen' : 'Selecciona cuenta')}
                                </Text>
                                <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                            </View>
                        </TouchableOpacity>

                        {/* Cuenta Destino - Solo para transferencias */}
                        {tipoTransaccion === 'Transferencia' && (
                            <>
                                <View style={styles.separadorCampo} />
                                <TouchableOpacity
                                    style={styles.campoSection}
                                    onPress={abrirModalCuentasDestino}
                                >
                                    <Text style={styles.campoLabel}>Cuenta Destino</Text>
                                    <View style={styles.campoInputContainer}>
                                        <Ionicons name="arrow-forward-circle-outline" size={20} color="#666" />
                                        <Text style={styles.campoTexto}>
                                            {cuentaDestino || 'Selecciona cuenta destino'}
                                        </Text>
                                        <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                                    </View>
                                </TouchableOpacity>
                            </>
                        )}

                        <View style={styles.separadorCampo} />

                        {/* Categoría - Solo mostrar si NO es transferencia */}
                        {tipoTransaccion !== 'Transferencia' && (
                            <>
                                <TouchableOpacity
                                    style={styles.campoSection}
                                    onPress={abrirModalCategorias}
                                >
                                    <Text style={styles.campoLabel}>Categoria</Text>
                                    <View style={styles.campoInputContainer}>
                                        <Ionicons name="apps-outline" size={20} color="#666" />
                                        <Text style={styles.campoTexto}>
                                            {categoria || 'Selecciona categoría'}
                                        </Text>
                                        <Ionicons name="chevron-forward-outline" size={20} color="#666" />
                                    </View>
                                </TouchableOpacity>

                                <View style={styles.separadorCampo} />
                            </>
                        )}

                        {/* Notas */}
                        <View style={styles.campoSection}>
                            <Text style={styles.campoLabel}>Notas</Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="chatbubble-outline" size={20} color="#666" />
                                <TextInput
                                    style={styles.campoInput}
                                    value={notas}
                                    onChangeText={setNotas}
                                    placeholder="Agrega notas"
                                    placeholderTextColor="#999"
                                    multiline
                                />
                            </View>
                        </View>
                    </ScrollView>

                    {/* Botón Guardar */}
                    <View style={styles.guardarContainer}>
                        <TouchableOpacity
                            style={styles.guardarButton}
                            onPress={guardarNuevaTransaccion}
                        >
                            <Text style={styles.guardarText}>Guardar</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {mostrarDatePicker && (
                    <DateTimePicker
                        value={fechaTransaccion}
                        mode="date"
                        display="default"
                        onChange={onChangeFecha}
                    />
                )}
            </Modal>

            {/* NUEVO: Modal de Selección de Categoría */}
            <Modal
                visible={modalCategorias}
                animationType="slide"
                transparent={true}
                onRequestClose={cerrarModalCategorias}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={cerrarModalCategorias}
                >
                    <View style={styles.modalTiposContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTiposTitulo}>Seleccionar Categoría</Text>

                            <ScrollView>
                                {CATEGORIAS_LISTA.map((cat, index) => (
                                    <View key={cat}>
                                        <TouchableOpacity
                                            style={styles.tipoItem}
                                            onPress={() => seleccionarCategoria(cat)}
                                        >
                                            <View style={styles.tipoTextos}>
                                                <Text style={[
                                                    styles.tipoTitulo,
                                                    cat === categoria && { color: '#4A8FE7' }
                                                ]}>
                                                    {cat}
                                                </Text>
                                            </View>
                                            {cat === categoria && (
                                                <Ionicons name="checkmark" size={24} color="#4A8FE7" />
                                            )}
                                        </TouchableOpacity>
                                        {index < CATEGORIAS_LISTA.length - 1 && (
                                            <View style={styles.separador} />
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* NUEVO: Modal de Selección de Cuenta */}
            <Modal
                visible={modalCuentas}
                animationType="slide"
                transparent={true}
                onRequestClose={cerrarModalCuentas}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={cerrarModalCuentas}
                >
                    <View style={styles.modalTiposContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTiposTitulo}>Seleccionar Cuenta</Text>

                            <ScrollView>
                                {cuentas.length === 0 ? (
                                    <View style={styles.emptyCuentas}>
                                        <Ionicons name="wallet-outline" size={48} color="#CCC" />
                                        <Text style={styles.emptyCuentasText}>No hay cuentas registradas</Text>
                                        <Text style={styles.emptyCuentasSubtext}>
                                            Ve a la sección de Cuentas para agregar una
                                        </Text>
                                    </View>
                                ) : (
                                    cuentas.map((cuentaItem, index) => (
                                        <View key={cuentaItem.id}>
                                            <TouchableOpacity
                                                style={styles.tipoItem}
                                                onPress={() => seleccionarCuenta(cuentaItem.nombre)}
                                            >
                                                <View style={styles.tipoIcono}>
                                                    <Ionicons name={cuentaItem.icono || 'wallet'} size={24} color="#000" />
                                                </View>
                                                <View style={styles.tipoTextos}>
                                                    <Text style={[
                                                        styles.tipoTitulo,
                                                        cuentaItem.nombre === cuenta && { color: '#4A8FE7' }
                                                    ]}>
                                                        {cuentaItem.nombre}
                                                    </Text>
                                                    <Text style={styles.tipoDescripcion}>
                                                        Saldo: ${cuentaItem.saldo.toFixed(2)}
                                                    </Text>
                                                </View>
                                                {cuentaItem.nombre === cuenta && (
                                                    <Ionicons name="checkmark" size={24} color="#4A8FE7" />
                                                )}
                                            </TouchableOpacity>
                                            {index < cuentas.length - 1 && (
                                                <View style={styles.separador} />
                                            )}
                                        </View>
                                    ))
                                )}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Modal de Selección de Cuenta Destino (Para Transferencias) */}
            <Modal
                visible={modalCuentasDestino}
                animationType="slide"
                transparent={true}
                onRequestClose={cerrarModalCuentasDestino}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={cerrarModalCuentasDestino}
                >
                    <View style={styles.modalTiposContainer}>
                        <TouchableOpacity activeOpacity={1}>
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTiposTitulo}>Seleccionar Cuenta Destino</Text>

                            <ScrollView>
                                {cuentas.length === 0 ? (
                                    <View style={styles.emptyCuentas}>
                                        <Ionicons name="wallet-outline" size={48} color="#CCC" />
                                        <Text style={styles.emptyCuentasText}>No hay cuentas registradas</Text>
                                        <Text style={styles.emptyCuentasSubtext}>
                                            Ve a la sección de Cuentas para agregar una
                                        </Text>
                                    </View>
                                ) : (
                                    cuentas
                                        .filter(c => c.nombre !== cuenta) // Filtrar la cuenta origen
                                        .map((cuentaItem, index, arr) => (
                                            <View key={cuentaItem.id}>
                                                <TouchableOpacity
                                                    style={styles.tipoItem}
                                                    onPress={() => seleccionarCuentaDestino(cuentaItem.nombre)}
                                                >
                                                    <View style={styles.tipoIcono}>
                                                        <Ionicons name={cuentaItem.icono || 'wallet'} size={24} color="#000" />
                                                    </View>
                                                    <View style={styles.tipoTextos}>
                                                        <Text style={[
                                                            styles.tipoTitulo,
                                                            cuentaItem.nombre === cuentaDestino && { color: '#4A8FE7' }
                                                        ]}>
                                                            {cuentaItem.nombre}
                                                        </Text>
                                                        <Text style={styles.tipoDescripcion}>
                                                            Saldo: ${cuentaItem.saldo.toFixed(2)}
                                                        </Text>
                                                    </View>
                                                    {cuentaItem.nombre === cuentaDestino && (
                                                        <Ionicons name="checkmark" size={24} color="#4A8FE7" />
                                                    )}
                                                </TouchableOpacity>
                                                {index < arr.length - 1 && (
                                                    <View style={styles.separador} />
                                                )}
                                            </View>
                                        ))
                                )}
                                {cuentas.length > 0 && cuentas.filter(c => c.nombre !== cuenta).length === 0 && (
                                    <View style={styles.emptyCuentas}>
                                        <Ionicons name="alert-circle-outline" size={48} color="#F59E0B" />
                                        <Text style={styles.emptyCuentasText}>Selecciona primero la cuenta origen</Text>
                                        <Text style={styles.emptyCuentasSubtext}>
                                            La cuenta destino debe ser diferente a la cuenta origen
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 16,
        backgroundColor: '#4A8FE7',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#4A8FE7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalTiposContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '80%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#000',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    modalTiposTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    tipoItem: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    tipoItemDisabled: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 15,
        opacity: 0.6,
    },
    tipoIcono: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    tipoTextos: {
        flex: 1,
        justifyContent: 'center',
    },
    tipoTitulo: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    tipoDescripcion: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    separador: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 20,
    },
    premiumBadge: {
        backgroundColor: '#FFD700',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginLeft: 8,
    },
    premiumText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
    },
    // Modal de agregar
    modalAgregarContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalAgregarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    modalAgregarTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    modalAgregarContenido: {
        flex: 1,
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
        gap: 12,
    },
    infoBannerTexto: {
        flex: 1,
        fontSize: 13,
        color: '#1E40AF',
        lineHeight: 18,
    },
    montoSection: {
        backgroundColor: '#fff',
        paddingVertical: 20,
        alignItems: 'center',
    },
    montoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    montoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    montoInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'left',
        minWidth: 150,
        paddingHorizontal: 0,
    },
    montoIcono: {
        marginLeft: 10,
    },
    campoSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    campoLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 8,
    },
    campoInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    campoInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
        textAlign: 'left',
        paddingVertical: 0,
    },
    campoTexto: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
        textAlign: 'left',
    },
    separadorCampo: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 20,
    },
    guardarContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    guardarButton: {
        backgroundColor: '#4A8FE7',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    guardarText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyCuentas: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyCuentasText: {
        fontSize: 16,
        color: '#666',
        marginTop: 16,
        fontWeight: '500',
    },
    emptyCuentasSubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default BotonAgregarTransaccion;