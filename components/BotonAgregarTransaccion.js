import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert, PanResponder, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
    guardarTransaccion, 
    obtenerSesion,
    obtenerCuentas,
    obtenerCategorias 
} from '../database/database';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const BotonAgregarTransaccion = ({ onTransaccionGuardada }) => {
    // Modal de selección de tipo
    const [modalTipos, setModalTipos] = useState(false);
    
    // Modal de agregar transacción
    const [modalAgregar, setModalAgregar] = useState(false);
    const [tipoTransaccion, setTipoTransaccion] = useState('');
    
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
        const sesion = await obtenerSesion();
        if (sesion) {
            setUsuarioEmail(sesion.email);
            const cuentasDb = await obtenerCuentas(sesion.email);
            const categoriasDb = await obtenerCategorias();
            setCuentas(cuentasDb || []);
            setCategorias(categoriasDb || []);
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

    const resetearFormulario = () => {
        setMonto('');
        setDescripcion('');
        setFechaTransaccion(new Date());
        setCuenta('');
        setCategoria('');
        setNotas('');
    };

    const onChangeFecha = (event, selectedDate) => {
        setMostrarDatePicker(false);
        if (selectedDate) {
            setFechaTransaccion(selectedDate);
        }
    };

    const guardarNuevaTransaccion = async () => {
        if (!monto || parseFloat(monto) <= 0) {
            Alert.alert('Error', 'Ingresa un monto válido');
            return;
        }

        if (!descripcion.trim()) {
            Alert.alert('Error', 'Ingresa una descripción');
            return;
        }

        const nuevaTransaccion = {
            tipo: tipoTransaccion,
            monto: parseFloat(monto),
            descripcion: descripcion,
            fecha_transaccion: fechaTransaccion.toISOString().split('T')[0],
            fecha_pago: fechaTransaccion.toISOString().split('T')[0],
            cuenta: cuenta || 'Sin cuenta',
            categoria: categoria || 'Sin categoría',
            notas: notas
        };

        try {
            await guardarTransaccion(nuevaTransaccion, usuarioEmail);
            Alert.alert('Éxito', 'Transacción guardada correctamente');
            setModalAgregar(false);
            resetearFormulario();
            
            // Notificar al componente padre que se guardó una transacción
            if (onTransaccionGuardada) {
                onTransaccionGuardada();
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar la transacción');
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
                                <Ionicons name="water" size={32} color="#4A8FE7" style={styles.montoIcono} />
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
                            </View>
                        </TouchableOpacity>

                        <View style={styles.separadorCampo} />

                        {/* Cuenta */}
                        <View style={styles.campoSection}>
                            <Text style={styles.campoLabel}>Cuenta</Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="wallet-outline" size={20} color="#666" />
                                <TextInput
                                    style={styles.campoInput}
                                    value={cuenta}
                                    onChangeText={setCuenta}
                                    placeholder="Selecciona cuenta"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.separadorCampo} />

                        {/* Categoría */}
                        <View style={styles.campoSection}>
                            <Text style={styles.campoLabel}>Categoria</Text>
                            <View style={styles.campoInputContainer}>
                                <Ionicons name="apps-outline" size={20} color="#666" />
                                <TextInput
                                    style={styles.campoInput}
                                    value={categoria}
                                    onChangeText={setCategoria}
                                    placeholder="Selecciona categoría"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.separadorCampo} />

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
        textAlign: 'center',
        minWidth: 200,
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
    },
    campoTexto: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 12,
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
});

export default BotonAgregarTransaccion;
