import * as SQLite from 'expo-sqlite';

let db;

// ============ INICIALIZACIÓN DE LA BASE DE DATOS ============
export const inicializarDB = async () => {
    try {
        db = await SQLite.openDatabaseAsync('ahorraplus.db');

        // Crear tabla de usuarios
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fecha_registro TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

        // Crear tabla de transacciones
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        tipo TEXT NOT NULL,
        monto REAL NOT NULL,
        categoria TEXT NOT NULL,
        descripcion TEXT,
        fecha_transaccion TEXT NOT NULL,
        fecha_pago TEXT,
        cuenta TEXT,
        notas TEXT,
        fecha TEXT NOT NULL,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
      );
    `);

        // Crear tabla de presupuestos
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS presupuestos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        categoria TEXT NOT NULL,
        monto_limite REAL NOT NULL,
        mes TEXT NOT NULL,
        año TEXT NOT NULL,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
      );
    `);

        // Crear tabla de sesión activa
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS sesion_activa (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        usuario_email TEXT,
        fecha_login TEXT
      );
    `);

        console.log('✅ Base de datos SQLite inicializada correctamente');
        return true;
    } catch (error) {
        console.error('❌ Error al inicializar DB:', error);
        return false;
    }
};

// ============ USUARIOS ============

export const registrarUsuario = async (email, password) => {
    try {
        await db.runAsync(
            'INSERT INTO usuarios (email, password) VALUES (?, ?)',
            [email.toLowerCase(), password]
        );
        return { success: true };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'Este correo ya está registrado' };
        }
        console.error('Error al registrar usuario:', error);
        return { success: false, error: 'Error al crear la cuenta' };
    }
};

export const validarCredenciales = async (email, password) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT * FROM usuarios WHERE email = ? AND password = ?',
            [email.toLowerCase(), password]
        );
        return result;
    } catch (error) {
        console.error('Error al validar credenciales:', error);
        return null;
    }
};

export const obtenerUsuarioPorEmail = async (email) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT * FROM usuarios WHERE email = ?',
            [email.toLowerCase()]
        );
        return result;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
};

export const actualizarPassword = async (email, nuevaPassword) => {
    try {
        await db.runAsync(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [nuevaPassword, email.toLowerCase()]
        );
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar contraseña:', error);
        return { success: false };
    }
};

export const obtenerTodosLosUsuarios = async () => {
    try {
        const result = await db.getAllAsync('SELECT email FROM usuarios');
        return result || [];
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return [];
    }
};

// ============ SESIÓN ============

export const guardarSesion = async (email) => {
    try {
        await db.runAsync('DELETE FROM sesion_activa');
        await db.runAsync(
            'INSERT INTO sesion_activa (id, usuario_email, fecha_login) VALUES (1, ?, datetime("now"))',
            [email.toLowerCase()]
        );
        return true;
    } catch (error) {
        console.error('Error al guardar sesión:', error);
        return false;
    }
};

export const obtenerSesion = async () => {
    try {
        const result = await db.getFirstAsync('SELECT * FROM sesion_activa WHERE id = 1');
        return result;
    } catch (error) {
        console.error('Error al obtener sesión:', error);
        return null;
    }
};

export const cerrarSesion = async () => {
    try {
        await db.runAsync('DELETE FROM sesion_activa');
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return false;
    }
};

// ============ TRANSACCIONES ============

export const guardarTransaccion = async (transaccion, usuarioEmail) => {
    try {
        const result = await db.runAsync(
            `INSERT INTO transacciones (usuario_email, tipo, monto, categoria, descripcion, fecha_transaccion, fecha_pago, cuenta, notas, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioEmail.toLowerCase(),
                transaccion.tipo,
                parseFloat(transaccion.monto),
                transaccion.categoria,
                transaccion.descripcion || '',
                transaccion.fecha_transaccion,
                transaccion.fecha_pago || transaccion.fecha_transaccion,
                transaccion.cuenta || 'Sin cuenta',
                transaccion.notas || '',
                transaccion.fecha_transaccion
            ]
        );
        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        console.error('Error al guardar transacción:', error);
        return { success: false };
    }
};

export const obtenerTransacciones = async (usuarioEmail) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? ORDER BY fecha DESC, fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener transacciones:', error);
        return [];
    }
};

export const actualizarTransaccion = async (id, transaccion) => {
    try {
        await db.runAsync(
            `UPDATE transacciones 
       SET tipo = ?, monto = ?, categoria = ?, descripcion = ?, fecha = ? 
       WHERE id = ?`,
            [
                transaccion.tipo,
                parseFloat(transaccion.monto),
                transaccion.categoria,
                transaccion.descripcion || '',
                transaccion.fecha,
                id
            ]
        );
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar transacción:', error);
        return { success: false };
    }
};

export const eliminarTransaccion = async (id) => {
    try {
        await db.runAsync('DELETE FROM transacciones WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        return { success: false };
    }
};

export const obtenerTransaccionesPorCategoria = async (usuarioEmail, categoria) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND categoria = ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), categoria]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener transacciones por categoría:', error);
        return [];
    }
};

export const obtenerTransaccionesPorFecha = async (usuarioEmail, fechaInicio, fechaFin) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND fecha BETWEEN ? AND ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), fechaInicio, fechaFin]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener transacciones por fecha:', error);
        return [];
    }
};

export const obtenerTransaccionesPorTipo = async (usuarioEmail, tipo) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND tipo = ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), tipo]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener transacciones por tipo:', error);
        return [];
    }
};

// Función para obtener resumen de transacciones por categoría para gráficas
export const obtenerResumenPorCategoria = async (usuarioEmail, tipo) => {
    try {
        const result = await db.getAllAsync(
            `SELECT categoria, SUM(monto) as total 
       FROM transacciones 
       WHERE usuario_email = ? AND tipo = ? 
       GROUP BY categoria`,
            [usuarioEmail.toLowerCase(), tipo]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener resumen por categoría:', error);
        return [];
    }
};

// Función para obtener transacciones del mes actual
export const obtenerTransaccionesDelMes = async (usuarioEmail, mes, año) => {
    try {
        const result = await db.getAllAsync(
            `SELECT * FROM transacciones 
       WHERE usuario_email = ? 
       AND strftime('%m', fecha) = ? 
       AND strftime('%Y', fecha) = ?
       ORDER BY fecha DESC`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener transacciones del mes:', error);
        return [];
    }
};

// Función para obtener totales por tipo y mes
export const obtenerTotalesPorMes = async (usuarioEmail, mes, año) => {
    try {
        const ingresos = await db.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND tipo = 'Ingreso'
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );

        const egresos = await db.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND tipo = 'Egreso'
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );

        return {
            ingresos: ingresos?.total || 0,
            egresos: egresos?.total || 0
        };
    } catch (error) {
        console.error('Error al obtener totales por mes:', error);
        return { ingresos: 0, egresos: 0 };
    }
};

// ============ PRESUPUESTOS ============

export const guardarPresupuesto = async (presupuesto, usuarioEmail) => {
    try {
        const result = await db.runAsync(
            'INSERT INTO presupuestos (usuario_email, categoria, monto_limite, mes, año) VALUES (?, ?, ?, ?, ?)',
            [
                usuarioEmail.toLowerCase(),
                presupuesto.categoria,
                parseFloat(presupuesto.monto_limite),
                presupuesto.mes,
                presupuesto.año
            ]
        );
        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        console.error('Error al guardar presupuesto:', error);
        return { success: false };
    }
};

export const obtenerPresupuestos = async (usuarioEmail) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? ORDER BY fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener presupuestos:', error);
        return [];
    }
};

export const obtenerPresupuestosPorMes = async (usuarioEmail, mes, año) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND mes = ? AND año = ?',
            [usuarioEmail.toLowerCase(), mes, año]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener presupuestos del mes:', error);
        return [];
    }
};

export const actualizarPresupuesto = async (id, presupuesto) => {
    try {
        await db.runAsync(
            'UPDATE presupuestos SET categoria = ?, monto_limite = ?, mes = ?, año = ? WHERE id = ?',
            [
                presupuesto.categoria,
                parseFloat(presupuesto.monto_limite),
                presupuesto.mes,
                presupuesto.año,
                id
            ]
        );
        return { success: true };
    } catch (error) {
        console.error('Error al actualizar presupuesto:', error);
        return { success: false };
    }
};

export const eliminarPresupuesto = async (id) => {
    try {
        await db.runAsync('DELETE FROM presupuestos WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
        return { success: false };
    }
};

export const obtenerPresupuestoPorCategoria = async (usuarioEmail, categoria, mes, año) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND categoria = ? AND mes = ? AND año = ?',
            [usuarioEmail.toLowerCase(), categoria, mes, año]
        );
        return result;
    } catch (error) {
        console.error('Error al obtener presupuesto por categoría:', error);
        return null;
    }
};

// Función para verificar si se excedió el presupuesto
export const verificarPresupuestoExcedido = async (usuarioEmail, categoria, mes, año) => {
    try {
        const presupuesto = await obtenerPresupuestoPorCategoria(usuarioEmail, categoria, mes, año);
        if (!presupuesto) return { excedido: false };

        const gastosCategoria = await db.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND categoria = ? AND tipo = 'Egreso'
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), categoria, mes.padStart(2, '0'), año]
        );

        const totalGastado = gastosCategoria?.total || 0;
        const excedido = totalGastado > presupuesto.monto_limite;

        return {
            excedido,
            limite: presupuesto.monto_limite,
            gastado: totalGastado,
            diferencia: totalGastado - presupuesto.monto_limite
        };
    } catch (error) {
        console.error('Error al verificar presupuesto:', error);
        return { excedido: false };
    }
};

export const obtenerPresupuestosPorCategoria = async (usuarioEmail, categoria) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND categoria = ? ORDER BY año DESC, mes DESC',
            [usuarioEmail.toLowerCase(), categoria]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener presupuestos por categoría:', error);
        return [];
    }
};

// ============ CUENTAS Y CATEGORÍAS ============

export const obtenerCuentas = async (usuarioEmail) => {
    // Por ahora devolvemos cuentas predefinidas
    // En el futuro se pueden obtener de la base de datos
    return [
        { id: 1, nombre: 'Efectivo' },
        { id: 2, nombre: 'Cuenta de Cheques' },
        { id: 3, nombre: 'Cuenta de Ahorros' },
        { id: 4, nombre: 'Tarjeta de Crédito' },
    ];
};

export const obtenerCategorias = async () => {
    // Por ahora devolvemos categorías predefinidas
    // En el futuro se pueden obtener de la base de datos
    return [
        { id: 1, nombre: 'Supermercado' },
        { id: 2, nombre: 'Transporte' },
        { id: 3, nombre: 'Servicios' },
        { id: 4, nombre: 'Restaurantes' },
        { id: 5, nombre: 'Entretenimiento' },
        { id: 6, nombre: 'Salud' },
        { id: 7, nombre: 'Educación' },
        { id: 8, nombre: 'Ropa' },
        { id: 9, nombre: 'Otros' },
    ];
};
