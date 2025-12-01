import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import BotonAgregarTransaccion from '../components/BotonAgregarTransaccion';
import { obtenerColorCategoria, obtenerColorPastelCategoria, obtenerCategoria } from '../constants/categories';
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
    obtenerCuentasUsuario
} from '../database/database';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Lista de categorías disponibles
const CATEGORIAS_LISTA = ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Educación', 'Otros'];

export default function PresupuestosMensuales() {
    const navigation = useNavigation();
    const isFocused = useIsFocused();

    // Diciembre como mes predeterminado (índice 11 = diciembre)
    const [mesIndex, setMesIndex] = useState(11);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [presupuestos, setPresupuestos] = useState([]);
    const [transaccionesPorCategoria, setTransaccionesPorCategoria] = useState({});
    const [gastosPorCategoria, setGastosPorCategoria] = useState({});
    const [usuarioEmail, setUsuarioEmail] = useState(null);

    // Modal de detalle de categoría (primera imagen)
    const [modalDetalle, setModalDetalle] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
    const [limiteGasto, setLimiteGasto] = useState('');

    // Modal de establecer límite
    const [modalEstablecerLimite, setModalEstablecerLimite] = useState(false);
    const [montoLimite, setMontoLimite] = useState('');

    // Modal de edición de transacción (segunda imagen)
    const [modalEditar, setModalEditar] = useState(false);
    const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
    const [monto, setMonto] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fechaTransaccion, setFechaTransaccion] = useState(new Date());
    const [fechaPago, setFechaPago] = useState(new Date());
    const [cuenta, setCuenta] = useState('');
    const [categoriaEdicion, setCategoriaEdicion] = useState('');
    const [notas, setNotas] = useState('');
    const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
    const [tipoFecha, setTipoFecha] = useState('transaccion');

    // Modales de selección
    const [modalSeleccionCategoria, setModalSeleccionCategoria] = useState(false);
    const [modalSeleccionCuenta, setModalSeleccionCuenta] = useState(false);
    const [cuentasUsuario, setCuentasUsuario] = useState([]);

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

    useEffect(() => {
        const cargarSesion = async () => {
            try {
                const sesion = await obtenerSesion();
                if (sesion) {
                    setUsuarioEmail(sesion.usuario_email);
                }
            } catch (error) {
                // Error silencioso
            }
        };
        cargarSesion();
    }, [isFocused]);

    useEffect(() => {
        if (usuarioEmail) {
            cargarDatos();
        }
    }, [usuarioEmail, mesIndex, anio]);

    const cargarDatos = async () => {
        try {
            if (!usuarioEmail) {
                return;
            }

            const mes = (mesIndex + 1).toString();

            // Obtener presupuestos del mes
            const presupuestosDB = await obtenerPresupuestosPorMes(usuarioEmail, mes, anio.toString());
            setPresupuestos(presupuestosDB || []);

            // Obtener transacciones del mes
            const transaccionesDB = await obtenerTransaccionesDelMes(usuarioEmail, mes, anio.toString());

            // Organizar transacciones y gastos por categoría
            const transPorCat = {};
            const gastosPorCat = {};

            (transaccionesDB || []).forEach(t => {
                // CORRECCIÓN: Incluir todos los tipos de egreso
                if (t.tipo === 'Egreso' || t.tipo === 'Gasto' || t.tipo === 'Pago') {
                    const cat = t.categoria || 'Otros';
                    if (!transPorCat[cat]) {
                        transPorCat[cat] = [];
                    }
                    transPorCat[cat].push(t);
                    gastosPorCat[cat] = (gastosPorCat[cat] || 0) + parseFloat(t.monto);
                }
            });

            setTransaccionesPorCategoria(transPorCat);
            setGastosPorCategoria(gastosPorCat);
        } catch (error) {
            // Error silencioso
        }
    };

    const cambiarMes = (direccion) => {
        let nuevoMes = mesIndex + direccion;
        let nuevoAnio = anio;

        if (nuevoMes > 11) {
            nuevoMes = 0;
            nuevoAnio++;
        } else if (nuevoMes < 0) {
            nuevoMes = 11;
            nuevoAnio--;
        }

        setMesIndex(nuevoMes);
        setAnio(nuevoAnio);
    };

    const abrirDetalleCategoria = (categoria) => {
        setCategoriaSeleccionada(categoria);
        const presupuestoCat = presupuestos.find(p => p.categoria === categoria);
        if (presupuestoCat) {
            setLimiteGasto(presupuestoCat.monto_limite.toString());
        } else {
            setLimiteGasto('');
        }
        setModalDetalle(true);
    };

    const abrirModalEstablecerLimite = () => {
        const presupuestoCat = presupuestos.find(p => p.categoria === categoriaSeleccionada);
        if (presupuestoCat) {
            setMontoLimite(presupuestoCat.monto_limite.toString());
        } else {
            setMontoLimite('');
        }
        setModalEstablecerLimite(true);
    };

    const aplicarLimiteSoloPeriodo = async () => {
        if (!montoLimite || parseFloat(montoLimite) <= 0) {
            Alert.alert('Error', 'Ingresa un límite válido');
            return;
        }

        try {
            const mes = (mesIndex + 1).toString();
            const presupuestoCat = presupuestos.find(p => p.categoria === categoriaSeleccionada);

            if (presupuestoCat) {
                // Actualizar presupuesto existente
                const presupuestoActualizado = {
                    categoria: categoriaSeleccionada,
                    monto_limite: parseFloat(montoLimite),
                    mes: mes,
                    año: anio.toString()
                };
                await actualizarPresupuesto(presupuestoCat.id, presupuestoActualizado);
            } else {
                // Crear nuevo presupuesto
                const nuevoPresupuesto = {
                    categoria: categoriaSeleccionada,
                    monto_limite: parseFloat(montoLimite),
                    mes: mes,
                    año: anio.toString()
                };
                await guardarPresupuesto(nuevoPresupuesto, usuarioEmail);
            }

            setModalEstablecerLimite(false);
            setModalDetalle(false);
            Alert.alert('Éxito', `Límite de $${montoLimite} establecido para ${categoriaSeleccionada}`);
            await cargarDatos();
        } catch (error) {
            Alert.alert('Error', 'No se pudo guardar el presupuesto');
        }
    };

    const aplicarLimiteTodosPeriodos = async () => {
        if (!montoLimite || parseFloat(montoLimite) <= 0) {
            Alert.alert('Error', 'Ingresa un límite válido');
            return;
        }

        setModalEstablecerLimite(false);
        setModalDetalle(false);
        Alert.alert('Éxito', 'Límite establecido para todos los períodos');
        cargarDatos();
    };

    const eliminarPresupuestoCategoria = async () => {
        if (!categoriaSeleccionada) return;

        Alert.alert(
            'Confirmar',
            `¿Deseas eliminar el presupuesto de ${categoriaSeleccionada}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const presupuestoCat = presupuestos.find(p => p.categoria === categoriaSeleccionada);
                            if (presupuestoCat) {
                                await eliminarPresupuesto(presupuestoCat.id);
                                setModalDetalle(false);
                                Alert.alert('Éxito', 'Presupuesto eliminado');
                                await cargarDatos();
                            }
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar el presupuesto');
                        }
                    }
                }
            ]
        );
    };

    const abrirEdicionTransaccion = async (transaccion) => {
        setTransaccionSeleccionada(transaccion);
        setMonto(transaccion.monto.toString());
        setDescripcion(transaccion.descripcion || 'Gasto');
        setFechaTransaccion(new Date(transaccion.fecha + 'T00:00:00'));
        setFechaPago(new Date(transaccion.fecha_pago ? transaccion.fecha_pago + 'T00:00:00' : transaccion.fecha + 'T00:00:00'));
        setCuenta(transaccion.cuenta || 'Efectivo');
        setCategoriaEdicion(transaccion.categoria || categoriaSeleccionada);
        setNotas(transaccion.notas || '');

        // Cargar cuentas del usuario
        try {
            if (usuarioEmail) {
                const cuentasDb = await obtenerCuentasUsuario(usuarioEmail);
                setCuentasUsuario(cuentasDb || []);
            }
        } catch (error) {
            console.error('Error al cargar cuentas:', error);
        }

        setModalEditar(true);
    };

    const guardarCambiosTransaccion = async () => {
        if (!transaccionSeleccionada) return;

        const transaccionActualizada = {
            tipo: transaccionSeleccionada.tipo,
            monto: parseFloat(monto),
            categoria: categoriaEdicion,
            descripcion: descripcion,
            fecha: fechaTransaccion.toISOString().split('T')[0],
            fecha_pago: fechaPago.toISOString().split('T')[0],
            cuenta: cuenta,
            notas: notas
        };

        const resultado = await actualizarTransaccion(transaccionSeleccionada.id, transaccionActualizada);
        if (resultado.success) {
            Alert.alert('Éxito', 'Transacción actualizada');
            setModalEditar(false);
            cargarDatos();
        } else {
            Alert.alert('Error', 'No se pudo actualizar');
        }
    };

    const eliminarTransaccionSeleccionada = async () => {
        if (!transaccionSeleccionada) return;

        Alert.alert(
            'Confirmar',
            '¿Deseas eliminar esta transacción?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        const resultado = await eliminarTransaccion(transaccionSeleccionada.id);
                        if (resultado.success) {
                            Alert.alert('Éxito', 'Transacción eliminada');
                            setModalEditar(false);
                            setModalDetalle(false);
                            cargarDatos();
                        }
                    }
                }
            ]
        );
    };

    const onChangeFecha = (event, selectedDate) => {
        setMostrarDatePicker(false);
        if (selectedDate) {
            if (tipoFecha === 'transaccion') {
                setFechaTransaccion(selectedDate);
            } else {
                setFechaPago(selectedDate);
            }
        }
    };

    const calcularTotales = () => {
        let totalLimite = 0;
        let totalGastado = 0;

        // Categorías principales que queremos mostrar
        const categoriasPrincipales = ['Comida', 'Transporte', 'Servicios', 'Otros'];

        categoriasPrincipales.forEach(cat => {
            const presupuesto = presupuestos.find(p => p.categoria === cat);
            if (presupuesto) {
                totalLimite += presupuesto.monto_limite;
            }
            totalGastado += gastosPorCategoria[cat] || 0;
        });

        return { totalLimite, totalGastado, restante: totalLimite - totalGastado };
    };

    const totales = calcularTotales();
    const porcentajeGastado = totales.totalLimite > 0 ? Math.round((totales.totalGastado / totales.totalLimite) * 100) : 0;

    // Calcular categorías que han excedido su presupuesto
    const categoriasExcedidas = () => {
        const excedidas = [];
        Object.keys(gastosPorCategoria).forEach(cat => {
            const presupuesto = presupuestos.find(p => p.categoria === cat);
            if (presupuesto) {
                const gastado = gastosPorCategoria[cat] || 0;
                if (gastado > presupuesto.monto_limite) {
                    excedidas.push({
                        categoria: cat,
                        limite: presupuesto.monto_limite,
                        gastado: gastado,
                        excedido: gastado - presupuesto.monto_limite
                    });
                }
            }
        });
        return excedidas;
    };

    const listaExcedidas = categoriasExcedidas();

    // Helper para obtener datos de una categoría
    const obtenerDatosCategoria = (categoria) => {
        const presupuesto = presupuestos.find(p => p.categoria === categoria);
        const gastado = gastosPorCategoria[categoria] || 0;
        const limite = presupuesto?.monto_limite || 0;
        const porcentaje = limite > 0 ? Math.min((gastado / limite) * 100, 100) : 0;
        const transacciones = transaccionesPorCategoria[categoria] || [];

        return { gastado, limite, porcentaje, transacciones };
    };

    return (
        <View style={styles.container}>
            {/* Header Superior - Barra gris con título */}
            <View style={styles.topBar}>
                <Text style={styles.topBarTitle}>Presupuesto</Text>
            </View>

            {/* Header Principal - Mes y controles */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.mesAnio}>{MESES[mesIndex]} {anio}</Text>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => cambiarMes(-1)}
                    >
                        <Ionicons name="chevron-back" size={20} color="#030213" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.headerIcon}
                        onPress={() => cambiarMes(1)}
                    >
                        <Ionicons name="chevron-forward" size={20} color="#030213" />
                    </TouchableOpacity>

                </View>
            </View>

            {/* Área de Contenido Principal */}
            <ScrollView style={styles.contentArea} contentContainerStyle={styles.contentContainer}>
                {/* Círculo de progreso y monto restante */}
                <View style={styles.budgetSummary}>
                    <View style={styles.progressRing}>
                        <Text style={styles.percentageText}>{porcentajeGastado}%</Text>
                    </View>
                    <View style={styles.remainingAmount}>
                        <Text style={styles.remainingLabel}>Restante</Text>
                        <Text style={styles.remainingValue}>${totales.restante.toFixed(2)}</Text>
                        <Text style={styles.spentText}>Gastado ${totales.totalGastado.toFixed(2)} de <Text style={styles.totalBudget}>${totales.totalLimite.toFixed(2)}</Text></Text>
                    </View>
                </View>

                {/* Banner de Alerta - Presupuestos Excedidos */}
                {listaExcedidas.length > 0 && (
                    <View style={styles.alertaBanner}>
                        <View style={styles.alertaIcono}>
                            <Ionicons name="warning" size={24} color="#fff" />
                        </View>
                        <View style={styles.alertaContenido}>
                            <Text style={styles.alertaTitulo}>
                                ⚠️ {listaExcedidas.length === 1 ? '¡Presupuesto excedido!' : `¡${listaExcedidas.length} presupuestos excedidos!`}
                            </Text>
                            {listaExcedidas.map((item, index) => (
                                <Text key={index} style={styles.alertaDetalle}>
                                    • {item.categoria}: excedido por ${item.excedido.toFixed(2)}
                                </Text>
                            ))}
                        </View>
                        <TouchableOpacity
                            style={styles.alertaCerrar}
                            onPress={() => {
                                Alert.alert(
                                    '📊 Resumen de Presupuestos Excedidos',
                                    listaExcedidas.map(item =>
                                        `${item.categoria}:\n   Límite: $${item.limite.toFixed(2)}\n   Gastado: $${item.gastado.toFixed(2)}\n   Excedido: $${item.excedido.toFixed(2)}`
                                    ).join('\n\n'),
                                    [{ text: 'Entendido', style: 'default' }]
                                );
                            }}
                        >
                            <Ionicons name="chevron-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Categorías de presupuesto solo si tienen gasto */}
                <View style={styles.categories}>
                    {Object.keys(gastosPorCategoria)
                        .filter(cat => gastosPorCategoria[cat] > 0)
                        .map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={styles.categoryItem}
                                onPress={() => abrirDetalleCategoria(cat)}
                            >
                                <View style={[styles.categoryIcon, {
                                    backgroundColor: obtenerColorPastelCategoria(cat)
                                }]}
                                >
                                    <Ionicons
                                        name={obtenerCategoria(cat).icono || 'ellipsis-horizontal'}
                                        size={24}
                                        color={obtenerColorCategoria(cat)}
                                    />
                                </View>
                                <View style={styles.categoryInfo}>
                                    <View style={styles.categoryHeader}>
                                        <Text style={styles.categoryName}>{cat}</Text>
                                        <Text style={styles.categoryAmount}>${obtenerDatosCategoria(cat).gastado.toFixed(2)}</Text>
                                    </View>
                                    <View style={styles.categoryProgress}>
                                        <View style={[styles.progressBar, {
                                            backgroundColor: obtenerDatosCategoria(cat).porcentaje > 90 ? '#F44336' : obtenerColorCategoria(cat),
                                            width: `${obtenerDatosCategoria(cat).porcentaje}%`
                                        }]} />
                                    </View>
                                    <Text style={styles.transactionCount}>
                                        {obtenerDatosCategoria(cat).transacciones.length} transacciones
                                        {obtenerDatosCategoria(cat).limite > 0 && ` • Límite: $${obtenerDatosCategoria(cat).limite.toFixed(2)}`}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                </View>

                {/* Modal de Detalle de Categoría (Primera Imagen) */}
                <Modal
                    visible={modalDetalle}
                    animationType="slide"
                    statusBarTranslucent
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setModalDetalle(false)}
                            >
                                <Ionicons name="arrow-back" size={28} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>{categoriaSeleccionada}</Text>
                            <Text style={styles.mesAnioModal}>{MESES[mesIndex].toLowerCase()} {anio}</Text>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Sección de límite */}
                            <View style={styles.limiteSection}>
                                <Text style={styles.limiteLabel}>Límite de gasto</Text>
                                <View style={styles.limiteBotonesContainer}>
                                    <TouchableOpacity
                                        style={styles.establecerButton}
                                        onPress={abrirModalEstablecerLimite}
                                    >
                                        <Ionicons name="pencil" size={16} color="#4A8FE7" />
                                        <Text style={styles.establecerText}>
                                            {obtenerDatosCategoria(categoriaSeleccionada).limite > 0 ? 'Editar límite' : 'Establecer límite'}
                                        </Text>
                                    </TouchableOpacity>

                                    {obtenerDatosCategoria(categoriaSeleccionada).limite > 0 && (
                                        <TouchableOpacity
                                            style={styles.eliminarButton}
                                            onPress={eliminarPresupuestoCategoria}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#F44336" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                            {/* Resumen financiero */}
                            <View style={styles.resumenSection}>
                                <View style={styles.resumenRow}>
                                    <Text style={styles.resumenLabel}>Límite establecido</Text>
                                    <Text style={styles.resumenValue}>${obtenerDatosCategoria(categoriaSeleccionada).limite.toFixed(2)}</Text>
                                </View>
                                <View style={styles.resumenRow}>
                                    <Text style={styles.resumenLabel}>Gastado</Text>
                                    <Text style={[styles.resumenValue, obtenerDatosCategoria(categoriaSeleccionada).porcentaje > 90 && { color: '#F44336' }]}>
                                        ${obtenerDatosCategoria(categoriaSeleccionada).gastado.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.resumenRow}>
                                    <Text style={styles.totalLabel}>Restante</Text>
                                    <Text style={[
                                        styles.totalValue,
                                        (obtenerDatosCategoria(categoriaSeleccionada).limite - obtenerDatosCategoria(categoriaSeleccionada).gastado) < 0 && { color: '#F44336' }
                                    ]}>
                                        ${(obtenerDatosCategoria(categoriaSeleccionada).limite - obtenerDatosCategoria(categoriaSeleccionada).gastado).toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.resumenRow}>
                                    <Text style={styles.resumenLabel}>Progreso</Text>
                                    <Text style={[
                                        styles.resumenValue,
                                        obtenerDatosCategoria(categoriaSeleccionada).porcentaje > 90 && { color: '#F44336' }
                                    ]}>
                                        {obtenerDatosCategoria(categoriaSeleccionada).porcentaje.toFixed(0)}%
                                    </Text>
                                </View>
                            </View>

                            {/* Lista de transacciones */}
                            <View style={styles.transaccionesSection}>
                                <Text style={styles.transaccionesTitulo}>Transacciones</Text>

                                {(!transaccionesPorCategoria[categoriaSeleccionada] || transaccionesPorCategoria[categoriaSeleccionada].length === 0) ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>No hay transacciones</Text>
                                    </View>
                                ) : (
                                    transaccionesPorCategoria[categoriaSeleccionada].map((transaccion) => {
                                        const fecha = new Date(transaccion.fecha + 'T00:00:00');
                                        const dia = fecha.getDate();
                                        const mesT = MESES[fecha.getMonth()].toLowerCase();
                                        const anioT = fecha.getFullYear();

                                        return (
                                            <TouchableOpacity
                                                key={transaccion.id}
                                                style={styles.transaccionItem}
                                                onPress={() => abrirEdicionTransaccion(transaccion)}
                                            >
                                                <View style={styles.transaccionHeader}>
                                                    <Text style={styles.fechaTransaccion}>{dia} {mesT} {anioT}</Text>
                                                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                                </View>
                                                <View style={styles.transaccionInfo}>
                                                    <View style={styles.iconoCategoria}>
                                                        <Ionicons name="people" size={20} color="#8BC34A" />
                                                    </View>
                                                    <View style={styles.transaccionTexto}>
                                                        <Text style={styles.transaccionTipo}>{transaccion.descripcion || 'Gasto'}</Text>
                                                        <Text style={styles.transaccionCuenta}>Efectivo</Text>
                                                    </View>
                                                    <View style={styles.transaccionMontos}>
                                                        <Text style={styles.montoPositivo}>${transaccion.monto.toFixed(2)}</Text>
                                                        <Text style={styles.montoNegativo}>-${transaccion.monto.toFixed(2)}</Text>
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Modal de Editar Transacción (Segunda Imagen) */}
                <Modal
                    visible={modalEditar}
                    animationType="slide"
                    statusBarTranslucent
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => setModalEditar(false)}
                            >
                                <Ionicons name="arrow-back" size={28} color="#000" />
                            </TouchableOpacity>
                            <Text style={styles.modalTitle}>Editar Gasto</Text>
                            <TouchableOpacity onPress={eliminarTransaccionSeleccionada}>
                                <Ionicons name="trash-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* Monto */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Monto</Text>
                                <TextInput
                                    style={styles.modalMonto}
                                    value={`$${monto}`}
                                    onChangeText={(text) => setMonto(text.replace('$', ''))}
                                    keyboardType="numeric"
                                />
                                <View style={styles.pagadoContainer}>
                                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                                    <Text style={styles.pagadoText}>PAGADO</Text>
                                </View>
                            </View>

                            {/* Descripción */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Descripción</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="receipt-outline" size={20} color="#666" />
                                    <TextInput
                                        style={styles.modalInput}
                                        value={descripcion}
                                        onChangeText={setDescripcion}
                                        placeholder="Gasto"
                                    />
                                </View>
                            </View>

                            {/* Fecha de Transacción */}
                            <TouchableOpacity
                                style={styles.modalSection}
                                onPress={() => {
                                    setTipoFecha('transaccion');
                                    setMostrarDatePicker(true);
                                }}
                            >
                                <Text style={styles.modalLabel}>Fecha de Transacción</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="calendar-outline" size={20} color="#666" />
                                    <Text style={styles.modalValue}>
                                        {fechaTransaccion.getDate()} {MESES[fechaTransaccion.getMonth()].toLowerCase()} {fechaTransaccion.getFullYear()}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Fecha de pago */}
                            <TouchableOpacity
                                style={styles.modalSection}
                                onPress={() => {
                                    setTipoFecha('pago');
                                    setMostrarDatePicker(true);
                                }}
                            >
                                <Text style={styles.modalLabel}>Fecha de pago</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="calendar-outline" size={20} color="#666" />
                                    <Text style={styles.modalValue}>
                                        {fechaPago.getDate()} {MESES[fechaPago.getMonth()].toLowerCase()} {fechaPago.getFullYear()}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {/* Cuenta */}
                            <TouchableOpacity
                                style={styles.modalSection}
                                onPress={() => setModalSeleccionCuenta(true)}
                            >
                                <Text style={styles.modalLabel}>Cuenta</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="wallet-outline" size={20} color="#666" />
                                    <Text style={styles.modalValue}>{cuenta || 'Seleccionar cuenta'}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </View>
                            </TouchableOpacity>

                            {/* Categoría */}
                            <TouchableOpacity
                                style={styles.modalSection}
                                onPress={() => setModalSeleccionCategoria(true)}
                            >
                                <Text style={styles.modalLabel}>Categoría</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="pricetag-outline" size={20} color="#666" />
                                    <Text style={styles.modalValue}>{categoriaEdicion || 'Seleccionar categoría'}</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#999" />
                                </View>
                            </TouchableOpacity>

                            {/* Notas */}
                            <View style={styles.modalSection}>
                                <Text style={styles.modalLabel}>Notas</Text>
                                <View style={styles.modalInputRow}>
                                    <Ionicons name="chatbox-outline" size={20} color="#666" />
                                    <TextInput
                                        style={styles.modalInput}
                                        value={notas}
                                        onChangeText={setNotas}
                                        placeholder=""
                                        multiline
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={styles.deshacerButton}
                                onPress={guardarCambiosTransaccion}
                            >
                                <Text style={styles.deshacerText}>Guardar Cambios</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </Modal>

                {/* Modal de Establecer Límite */}
                <Modal
                    visible={modalEstablecerLimite}
                    animationType="fade"
                    transparent={true}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalLimiteContainer}>
                            <Text style={styles.modalLimiteTitulo}>{categoriaSeleccionada}</Text>
                            <Text style={styles.modalLimiteSubtitulo}>
                                {MESES[mesIndex]} {anio}
                            </Text>

                            <Text style={styles.modalLimiteLabel}>Límite de gasto mensual</Text>

                            <View style={styles.inputConPrefijo}>
                                <Text style={styles.prefijoDolar}>$</Text>
                                <TextInput
                                    style={styles.modalLimiteInput}
                                    value={montoLimite}
                                    onChangeText={setMontoLimite}
                                    keyboardType="numeric"
                                    placeholder="0.00"
                                    placeholderTextColor="#999"
                                />
                            </View>

                            {obtenerDatosCategoria(categoriaSeleccionada).gastado > 0 && (
                                <View style={styles.infoGastado}>
                                    <Ionicons name="information-circle" size={20} color="#666" />
                                    <Text style={styles.infoGastadoTexto}>
                                        Ya has gastado ${obtenerDatosCategoria(categoriaSeleccionada).gastado.toFixed(2)} en {categoriaSeleccionada} este mes
                                    </Text>
                                </View>
                            )}

                            <TouchableOpacity
                                style={styles.modalLimiteBotonPrincipal}
                                onPress={aplicarLimiteSoloPeriodo}
                            >
                                <Text style={styles.modalLimiteBotonPrincipalTexto}>Guardar límite</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalLimiteCancelar}
                                onPress={() => setModalEstablecerLimite(false)}
                            >
                                <Text style={styles.modalLimiteCancelarTexto}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {mostrarDatePicker && (
                    <DateTimePicker
                        value={tipoFecha === 'transaccion' ? fechaTransaccion : fechaPago}
                        mode="date"
                        display="default"
                        onChange={onChangeFecha}
                    />
                )}

                {/* Modal de Selección de Categoría */}
                <Modal
                    visible={modalSeleccionCategoria}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalSeleccionCategoria(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlaySeleccion}
                        activeOpacity={1}
                        onPress={() => setModalSeleccionCategoria(false)}
                    >
                        <View style={styles.modalSeleccionContainer}>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={styles.modalHandle} />
                                <Text style={styles.modalSeleccionTitulo}>Seleccionar Categoría</Text>

                                <ScrollView style={styles.listaSeleccion}>
                                    {CATEGORIAS_LISTA.map((cat, index) => (
                                        <View key={cat}>
                                            <TouchableOpacity
                                                style={styles.itemSeleccion}
                                                onPress={() => {
                                                    setCategoriaEdicion(cat);
                                                    setModalSeleccionCategoria(false);
                                                }}
                                            >
                                                <Text style={[
                                                    styles.itemSeleccionTexto,
                                                    cat === categoriaEdicion && { color: '#4A8FE7', fontWeight: 'bold' }
                                                ]}>
                                                    {cat}
                                                </Text>
                                                {cat === categoriaEdicion && (
                                                    <Ionicons name="checkmark" size={24} color="#4A8FE7" />
                                                )}
                                            </TouchableOpacity>
                                            {index < CATEGORIAS_LISTA.length - 1 && (
                                                <View style={styles.separadorSeleccion} />
                                            )}
                                        </View>
                                    ))}
                                </ScrollView>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>

                {/* Modal de Selección de Cuenta */}
                <Modal
                    visible={modalSeleccionCuenta}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setModalSeleccionCuenta(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlaySeleccion}
                        activeOpacity={1}
                        onPress={() => setModalSeleccionCuenta(false)}
                    >
                        <View style={styles.modalSeleccionContainer}>
                            <TouchableOpacity activeOpacity={1}>
                                <View style={styles.modalHandle} />
                                <Text style={styles.modalSeleccionTitulo}>Seleccionar Cuenta</Text>

                                <ScrollView style={styles.listaSeleccion}>
                                    {cuentasUsuario.length === 0 ? (
                                        <View style={styles.sinCuentas}>
                                            <Ionicons name="wallet-outline" size={48} color="#CCC" />
                                            <Text style={styles.sinCuentasTexto}>No hay cuentas registradas</Text>
                                            <Text style={styles.sinCuentasSubtexto}>
                                                Ve a la sección de Cuentas para agregar una
                                            </Text>
                                        </View>
                                    ) : (
                                        cuentasUsuario.map((cuentaItem, index) => (
                                            <View key={cuentaItem.id}>
                                                <TouchableOpacity
                                                    style={styles.itemSeleccion}
                                                    onPress={() => {
                                                        setCuenta(cuentaItem.nombre);
                                                        setModalSeleccionCuenta(false);
                                                    }}
                                                >
                                                    <View style={styles.itemCuentaInfo}>
                                                        <View style={styles.iconoCuenta}>
                                                            <Ionicons name={cuentaItem.icono || 'wallet'} size={24} color="#4A8FE7" />
                                                        </View>
                                                        <View>
                                                            <Text style={[
                                                                styles.itemSeleccionTexto,
                                                                cuentaItem.nombre === cuenta && { color: '#4A8FE7', fontWeight: 'bold' }
                                                            ]}>
                                                                {cuentaItem.nombre}
                                                            </Text>
                                                            <Text style={styles.saldoCuenta}>
                                                                Saldo: ${cuentaItem.saldo?.toFixed(2) || '0.00'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    {cuentaItem.nombre === cuenta && (
                                                        <Ionicons name="checkmark" size={24} color="#4A8FE7" />
                                                    )}
                                                </TouchableOpacity>
                                                {index < cuentasUsuario.length - 1 && (
                                                    <View style={styles.separadorSeleccion} />
                                                )}
                                            </View>
                                        ))
                                    )}
                                </ScrollView>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </ScrollView>

            {/* Botón Flotante (FAB) funcional */}
            <BotonAgregarTransaccion onTransaccionGuardada={cargarDatos} />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        paddingTop: 0,
    },
    topBar: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    topBarTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#030213',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    headerLeft: {
        flex: 1,
    },
    mesAnio: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#030213',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerIcon: {
        width: 32,
        height: 32,
        backgroundColor: '#E3F2FD',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 8,
    },
    contentArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    contentContainer: {
        flexGrow: 1,
    },
    budgetSummary: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    progressRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 12,
        borderColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    percentageText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#030213',
    },
    remainingAmount: {
        flex: 1,
    },
    remainingLabel: {
        fontSize: 16,
        color: '#717182',
        marginBottom: 4,
    },
    remainingValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#030213',
        marginBottom: 4,
    },
    spentText: {
        fontSize: 14,
        color: '#717182',
    },
    totalBudget: {
        color: '#4A8FE7',
    },
    categories: {
        paddingHorizontal: 20,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    categoryInfo: {
        flex: 1,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#030213',
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#030213',
    },
    categoryProgress: {
        height: 4,
        backgroundColor: '#E3F2FD',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    transactionCount: {
        fontSize: 12,
        color: '#717182',
    },
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
        zIndex: 1,
    },
    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
        textAlign: 'center',
    },
    mesAnioModal: {
        fontSize: 12,
        color: '#666',
    },
    modalContent: {
        flex: 1,
    },
    // Sección de límite (primera imagen)
    limiteSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        marginBottom: 1,
    },
    limiteLabel: {
        fontSize: 16,
        color: '#000',
        flex: 1,
    },
    limiteBotonesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    establecerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    establecerText: {
        color: '#4A8FE7',
        fontSize: 14,
        fontWeight: '500',
    },
    eliminarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Resumen financiero (primera imagen)
    resumenSection: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 8,
    },
    resumenRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    resumenLabel: {
        fontSize: 16,
        color: '#000',
    },
    resumenValue: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    // Transacciones (primera imagen)
    transaccionesSection: {
        backgroundColor: '#fff',
        paddingTop: 16,
        marginTop: 8,
    },
    transaccionesTitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    emptyState: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#999',
        fontSize: 14,
    },
    transaccionItem: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    transaccionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    fechaTransaccion: {
        fontSize: 12,
        color: '#666',
    },
    transaccionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconoCategoria: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#C5E1A5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    transaccionTexto: {
        flex: 1,
    },
    transaccionTipo: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    transaccionCuenta: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    transaccionMontos: {
        alignItems: 'flex-end',
    },
    montoPositivo: {
        fontSize: 16,
        color: '#000',
        fontWeight: '500',
    },
    montoNegativo: {
        fontSize: 14,
        color: '#F44336',
        marginTop: 2,
    },
    // Modal de edición (segunda imagen)
    modalSection: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    modalLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    modalMonto: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 8,
    },
    pagadoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pagadoText: {
        color: '#4CAF50',
        fontSize: 14,
        fontWeight: '600',
    },
    modalInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    modalInput: {
        fontSize: 16,
        color: '#000',
        flex: 1,
        paddingVertical: 4,
    },
    modalValue: {
        fontSize: 16,
        color: '#000',
    },
    deshacerButton: {
        backgroundColor: '#E3F2FD',
        marginHorizontal: 20,
        marginVertical: 20,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    deshacerText: {
        color: '#4A8FE7',
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal de establecer límite
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalLimiteContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    modalLimiteTitulo: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },
    modalLimiteSubtitulo: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    modalLimiteLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    inputConPrefijo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#4A8FE7',
        marginBottom: 24,
    },
    prefijoDolar: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4A8FE7',
        marginRight: 8,
    },
    modalLimiteInput: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        minWidth: 150,
        paddingVertical: 8,
    },
    infoGastado: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
        gap: 8,
    },
    infoGastadoTexto: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    modalLimiteBotonPrincipal: {
        backgroundColor: '#4A8FE7',
        paddingVertical: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    modalLimiteBotonPrincipalTexto: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    modalLimiteBoton: {
        paddingVertical: 14,
        marginBottom: 12,
    },
    modalLimiteBotonTexto: {
        color: '#4A8FE7',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    modalLimiteCancelar: {
        paddingVertical: 14,
    },
    modalLimiteCancelarTexto: {
        color: '#666',
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '600',
    },
    // Estilos para modales de selección de categoría y cuenta
    modalOverlaySeleccion: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalSeleccionContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        maxHeight: '70%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#DDD',
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    modalSeleccionTitulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    listaSeleccion: {
        maxHeight: 400,
    },
    itemSeleccion: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    itemSeleccionTexto: {
        fontSize: 16,
        color: '#000',
    },
    separadorSeleccion: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginHorizontal: 20,
    },
    itemCuentaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconoCuenta: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    saldoCuenta: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    sinCuentas: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    sinCuentasTexto: {
        fontSize: 16,
        color: '#666',
        marginTop: 12,
        fontWeight: '500',
    },
    sinCuentasSubtexto: {
        fontSize: 14,
        color: '#999',
        marginTop: 4,
        textAlign: 'center',
    },
    // Estilos para el banner de alerta de presupuesto excedido
    alertaBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        marginHorizontal: 16,
        marginBottom: 16,
        padding: 12,
        borderRadius: 12,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    alertaIcono: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    alertaContenido: {
        flex: 1,
    },
    alertaTitulo: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    alertaDetalle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.9)',
        marginTop: 2,
    },
    alertaCerrar: {
        padding: 8,
    },
});

