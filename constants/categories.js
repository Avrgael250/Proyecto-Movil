// Categorías unificadas con colores pastel para toda la aplicación
// Basado en las categorías de ScreenDeTransacciones y colores de PresupuestosMensuales

export const CATEGORIAS = {
    // Gastos
    Comida: {
        id: 1,
        tipo: 'gasto',
        color: '#2196F3',        // Azul
        colorPastel: '#E3F2FD',  // Azul pastel
        icono: 'restaurant',
    },
    Transporte: {
        id: 2,
        tipo: 'gasto',
        color: '#FF9800',        // Naranja
        colorPastel: '#FFF3E0',  // Naranja pastel
        icono: 'car',
    },
    Entretenimiento: {
        id: 3,
        tipo: 'gasto',
        color: '#9C27B0',        // Púrpura
        colorPastel: '#F3E5F5',  // Púrpura pastel
        icono: 'game-controller',
    },
    Salud: {
        id: 4,
        tipo: 'gasto',
        color: '#4CAF50',        // Verde
        colorPastel: '#E8F5E9',  // Verde pastel
        icono: 'medical',
    },
    Educación: {
        id: 5,
        tipo: 'gasto',
        color: '#00BCD4',        // Cyan
        colorPastel: '#E0F7FA',  // Cyan pastel
        icono: 'school',
    },
    Servicios: {
        id: 10,
        tipo: 'gasto',
        color: '#795548',        // Marrón
        colorPastel: '#EFEBE9',  // Marrón pastel
        icono: 'construct',
    },
    Otros: {
        id: 9,
        tipo: 'gasto',
        color: '#607D8B',        // Gris azulado
        colorPastel: '#ECEFF1',  // Gris pastel
        icono: 'ellipsis-horizontal',
    },

    // Ingresos
    Salario: {
        id: 6,
        tipo: 'ingreso',
        color: '#4CAF50',        // Verde
        colorPastel: '#E8F5E9',  // Verde pastel
        icono: 'cash',
    },
    Inversiones: {
        id: 7,
        tipo: 'ingreso',
        color: '#3F51B5',        // Índigo
        colorPastel: '#E8EAF6',  // Índigo pastel
        icono: 'trending-up',
    },
    Regalos: {
        id: 8,
        tipo: 'ingreso',
        color: '#E91E63',        // Rosa
        colorPastel: '#FCE4EC',  // Rosa pastel
        icono: 'gift',
    },
    Reembolso: {
        id: 11,
        tipo: 'ingreso',
        color: '#009688',        // Teal
        colorPastel: '#E0F2F1',  // Teal pastel
        icono: 'return-down-back',
    },
};

// Función helper para obtener datos de una categoría
export const obtenerCategoria = (nombre) => {
    return CATEGORIAS[nombre] || {
        color: '#607D8B',
        colorPastel: '#ECEFF1',
        icono: 'help-circle',
        tipo: 'gasto',
    };
};

// Obtener solo el color de una categoría
export const obtenerColorCategoria = (nombre) => {
    return obtenerCategoria(nombre).color;
};

// Obtener solo el color pastel de una categoría
export const obtenerColorPastelCategoria = (nombre) => {
    return obtenerCategoria(nombre).colorPastel;
};

// Obtener categorías por tipo (para selectores)
export const obtenerCategoriasPorTipo = (tipo) => {
    return Object.entries(CATEGORIAS)
        .filter(([_, data]) => data.tipo === tipo)
        .map(([nombre, data]) => ({
            id: data.id,
            nombre,
            ...data,
        }));
};

// Lista de todas las categorías (formato compatible con DatosEjemplo.js)
export const categoriasLista = Object.entries(CATEGORIAS).map(([nombre, data]) => ({
    id: data.id,
    nombre,
    tipo: data.tipo,
    color: data.color,
    colorPastel: data.colorPastel,
    icono: data.icono,
}));

// Colores para gráficas (array ordenado)
export const COLORES_GRAFICAS = [
    '#2196F3', // Comida
    '#FF9800', // Transporte
    '#9C27B0', // Entretenimiento
    '#4CAF50', // Salud
    '#00BCD4', // Educación
    '#795548', // Servicios
    '#607D8B', // Otros
    '#3F51B5', // Inversiones
    '#E91E63', // Regalos
    '#009688', // Reembolso
];
