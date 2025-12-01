import * as SQLite from 'expo-sqlite';

let db = null;

// Función auxiliar para asegurar que la DB está inicializada
const getDB = async () => {
    if (db) {
        try {
            // Verificar si la conexión sigue siendo válida
            await db.getFirstAsync('SELECT 1');
            return db;
        } catch (error) {
            // La conexión ya no es válida, reconectar
            db = null;
        }
    }

    try {
        db = await SQLite.openDatabaseAsync('ahorraplus.db');
        return db;
    } catch (error) {
        throw error;
    }
};

// ============ INICIALIZACIÓN DE LA BASE DE DATOS ============
export const inicializarDB = async () => {
    try {
        db = await getDB();

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

        // Migración: Verificar y agregar columnas faltantes en transacciones si es necesario
        try {
            // Intentar agregar fecha_transaccion si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN fecha_transaccion TEXT`);
        } catch (error) {
            // Si ya existe, ignorar el error
        }

        try {
            // Intentar agregar fecha_pago si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN fecha_pago TEXT`);
        } catch (error) {
            // Si ya existe, ignorar el error
        }

        try {
            // Intentar agregar cuenta si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN cuenta TEXT`);
        } catch (error) {
            // Si ya existe, ignorar el error
        }

        try {
            // Intentar agregar notas si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN notas TEXT`);
        } catch (error) {
            // Si ya existe, ignorar el error
        }

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

        // Crear tabla de cuentas
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cuentas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT NOT NULL,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL,
        saldo REAL DEFAULT 0,
        icono TEXT DEFAULT 'wallet',
        presupuesto REAL DEFAULT 0,
        gastado REAL DEFAULT 0,
        fecha_creacion TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_email) REFERENCES usuarios(email)
      );
    `);

        return true;
    } catch (error) {
        return false;
    }
};

// ============ USUARIOS ============

export const registrarUsuario = async (email, password) => {
    try {
        const database = await getDB();
        await database.runAsync(
            'INSERT INTO usuarios (email, password) VALUES (?, ?)',
            [email.toLowerCase(), password]
        );
        return { success: true };
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'Este correo ya está registrado' };
        }
        return { success: false, error: 'Error al crear la cuenta' };
    }
};

export const validarCredenciales = async (email, password) => {
    try {
        const database = await getDB();
        const result = await database.getFirstAsync(
            'SELECT * FROM usuarios WHERE email = ? AND password = ?',
            [email.toLowerCase(), password]
        );
        return result;
    } catch (error) {
        return null;
    }
};

export const obtenerUsuarioPorEmail = async (email) => {
    try {
        const database = await getDB();
        const result = await database.getFirstAsync(
            'SELECT * FROM usuarios WHERE email = ?',
            [email.toLowerCase()]
        );
        return result;
    } catch (error) {
        return null;
    }
};

export const actualizarPassword = async (email, nuevaPassword) => {
    try {
        const database = await getDB();
        await database.runAsync(
            'UPDATE usuarios SET password = ? WHERE email = ?',
            [nuevaPassword, email.toLowerCase()]
        );
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const obtenerTodosLosUsuarios = async () => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync('SELECT email FROM usuarios');
        return result || [];
    } catch (error) {
        return [];
    }
};

// ============ SESIÓN ============

export const guardarSesion = async (email) => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM sesion_activa');
        await database.runAsync(
            'INSERT INTO sesion_activa (id, usuario_email, fecha_login) VALUES (1, ?, datetime("now"))',
            [email.toLowerCase()]
        );
        return true;
    } catch (error) {
        return false;
    }
};

export const obtenerSesion = async () => {
    try {
        const database = await getDB();
        if (!database) {
            return null;
        }

        const result = await database.getFirstAsync('SELECT * FROM sesion_activa WHERE id = 1');
        return result;
    } catch (error) {
        return null;
    }
};

export const cerrarSesion = async () => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM sesion_activa');
        return true;
    } catch (error) {
        return false;
    }
};

// Función helper para desarrollo - crear sesión de prueba si no existe
export const verificarOCrearSesionPrueba = async () => {
    try {
        const database = await getDB();

        // Verificar si hay sesión activa
        const sesion = await obtenerSesion();
        if (sesion) {
            return sesion;
        }

        // Si no hay sesión, buscar cualquier usuario en la DB
        const todosLosUsuarios = await database.getAllAsync('SELECT * FROM usuarios LIMIT 1');

        if (todosLosUsuarios && todosLosUsuarios.length > 0) {
            const usuario = todosLosUsuarios[0];
            await guardarSesion(usuario.email);
            const nuevaSesion = await obtenerSesion();
            return nuevaSesion;
        }

        // Si no hay usuarios, crear uno de prueba
        const emailPrueba = '124051493@gmail.com';
        const passwordPrueba = '123456';

        await database.runAsync(
            'INSERT OR IGNORE INTO usuarios (email, password) VALUES (?, ?)',
            [emailPrueba, passwordPrueba]
        );

        await guardarSesion(emailPrueba);

        const nuevaSesion = await obtenerSesion();
        return nuevaSesion;
    } catch (error) {
        return null;
    }
};

// ============ TRANSACCIONES ============

export const guardarTransaccion = async (transaccion, usuarioEmail) => {
    try {
        if (!usuarioEmail) {
            throw new Error('No hay usuario activo');
        }

        const database = await getDB();
        if (!database) {
            throw new Error('Base de datos no inicializada');
        }

        // Validar datos requeridos
        if (!transaccion.tipo || !transaccion.monto || !transaccion.fecha_transaccion) {
            throw new Error('Faltan datos requeridos en la transacción');
        }

        // 1. Guardar la transacción
        const result = await database.runAsync(
            `INSERT INTO transacciones (usuario_email, tipo, monto, categoria, descripcion, fecha_transaccion, fecha_pago, cuenta, notas, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioEmail.toLowerCase(),
                transaccion.tipo,
                parseFloat(transaccion.monto),
                transaccion.categoria || 'Otros',
                transaccion.descripcion || '',
                transaccion.fecha_transaccion,
                transaccion.fecha_pago || transaccion.fecha_transaccion,
                transaccion.cuenta || 'Sin cuenta',
                transaccion.notas || '',
                transaccion.fecha_transaccion
            ]
        );

        // 2. Actualizar el saldo de la cuenta automáticamente
        if (transaccion.cuenta && transaccion.cuenta !== 'Sin cuenta') {
            const cuenta = await database.getFirstAsync(
                'SELECT * FROM cuentas WHERE nombre = ? AND usuario_email = ?',
                [transaccion.cuenta, usuarioEmail.toLowerCase()]
            );

            if (cuenta) {
                let nuevoSaldo = parseFloat(cuenta.saldo);
                const monto = parseFloat(transaccion.monto);

                // Actualizar saldo según el tipo de transacción
                if (transaccion.tipo === 'Gasto' || transaccion.tipo === 'Pago') {
                    nuevoSaldo -= monto; // Resta para gastos y pagos
                } else if (transaccion.tipo === 'Ingreso' || transaccion.tipo === 'Reembolso') {
                    nuevoSaldo += monto; // Suma para ingresos y reembolsos
                }

                // Guardar el nuevo saldo
                await database.runAsync(
                    'UPDATE cuentas SET saldo = ? WHERE id = ?',
                    [nuevoSaldo, cuenta.id]
                );
            }
        }

        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const obtenerTransacciones = async (usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? ORDER BY fecha DESC, fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

export const actualizarTransaccion = async (id, transaccion) => {
    try {
        const database = await getDB();
        await database.runAsync(
            `UPDATE transacciones 
       SET tipo = ?, monto = ?, categoria = ?, descripcion = ?, fecha = ?, fecha_pago = ?, cuenta = ?, notas = ? 
       WHERE id = ?`,
            [
                transaccion.tipo,
                parseFloat(transaccion.monto),
                transaccion.categoria,
                transaccion.descripcion || '',
                transaccion.fecha,
                transaccion.fecha_pago || transaccion.fecha,
                transaccion.cuenta || '',
                transaccion.notas || '',
                id
            ]
        );
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const eliminarTransaccion = async (id) => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM transacciones WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const obtenerTransaccionesPorCategoria = async (usuarioEmail, categoria) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND categoria = ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), categoria]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

export const obtenerTransaccionesPorFecha = async (usuarioEmail, fechaInicio, fechaFin) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND fecha BETWEEN ? AND ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), fechaInicio, fechaFin]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

export const obtenerTransaccionesPorTipo = async (usuarioEmail, tipo) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM transacciones WHERE usuario_email = ? AND tipo = ? ORDER BY fecha DESC',
            [usuarioEmail.toLowerCase(), tipo]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función para obtener resumen de transacciones por categoría para gráficas (ej: Ingreso)
export const obtenerResumenPorCategoria = async (usuarioEmail, tipo) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            `SELECT categoria, SUM(monto) as total 
       FROM transacciones 
       WHERE usuario_email = ? AND tipo = ? 
       GROUP BY categoria`,
            [usuarioEmail.toLowerCase(), tipo]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función NUEVA para obtener resumen de Egresos (Gasto + Pago) por categoría para gráficas
export const obtenerResumenEgresos = async (usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            `SELECT categoria, SUM(monto) as total 
       FROM transacciones 
       WHERE usuario_email = ? AND tipo IN ('Gasto', 'Pago') 
       GROUP BY categoria`,
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función para obtener transacciones del mes actual
export const obtenerTransaccionesDelMes = async (usuarioEmail, mes, año) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            `SELECT * FROM transacciones 
       WHERE usuario_email = ? 
       AND strftime('%m', fecha) = ? 
       AND strftime('%Y', fecha) = ?
       ORDER BY fecha DESC`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función para obtener totales por tipo y mes
export const obtenerTotalesPorMes = async (usuarioEmail, mes, año) => {
    try {
        const database = await getDB();
        const ingresos = await database.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND tipo IN ('Ingreso', 'Reembolso')
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );

        const egresos = await database.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND tipo IN ('Gasto', 'Pago')
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), mes.padStart(2, '0'), año]
        );

        return {
            ingresos: ingresos?.total || 0,
            egresos: egresos?.total || 0
        };
    } catch (error) {
        return { ingresos: 0, egresos: 0 };
    }
};

// Función para obtener próximos pagos pendientes (transacciones con fecha_pago futura)
export const obtenerProximosPagos = async (usuarioEmail, limite = 5) => {
    try {
        const database = await getDB();
        const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const result = await database.getAllAsync(
            `SELECT * FROM transacciones 
             WHERE usuario_email = ? 
             AND (fecha_pago >= ? OR fecha >= ?)
             AND tipo IN ('Pago', 'Gasto')
             ORDER BY fecha_pago ASC, fecha ASC
             LIMIT ?`,
            [usuarioEmail.toLowerCase(), hoy, hoy, limite]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función para obtener historial de transacciones recientes
export const obtenerHistorialReciente = async (usuarioEmail, limite = 5) => {
    try {
        const database = await getDB();

        const result = await database.getAllAsync(
            `SELECT * FROM transacciones 
             WHERE usuario_email = ? 
             ORDER BY fecha DESC, id DESC
             LIMIT ?`,
            [usuarioEmail.toLowerCase(), limite]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Función para obtener historial de gastos por categoría para gráficas de línea
export const obtenerHistorialPorCategoria = async (usuarioEmail, tipoTiempo = 'Mensual', rangoData = null) => {
    try {
        const database = await getDB();
        const now = new Date();
        const año = now.getFullYear();
        const resultado = [];

        // Obtener las categorías únicas de gastos
        const categorias = await database.getAllAsync(
            `SELECT DISTINCT categoria FROM transacciones 
             WHERE usuario_email = ? 
             AND tipo IN ('Gasto', 'Pago', 'Egreso')
             AND categoria IS NOT NULL`,
            [usuarioEmail.toLowerCase()]
        );

        if (tipoTiempo === 'Mensual' && rangoData?.mesesData) {
            // Usar los meses específicos del rango
            const mesesData = rangoData.mesesData;

            // Obtener total general por mes
            const datosTotal = [];
            for (const periodo of mesesData) {
                const mesStr = periodo.mes.toString().padStart(2, '0');
                const añoStr = periodo.año.toString();
                const totalMes = await database.getFirstAsync(
                    `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                     WHERE usuario_email = ? 
                     AND tipo IN ('Gasto', 'Pago', 'Egreso')
                     AND strftime('%m', fecha) = ?
                     AND strftime('%Y', fecha) = ?`,
                    [usuarioEmail.toLowerCase(), mesStr, añoStr]
                );
                datosTotal.push(Math.round(totalMes?.total || 0));
            }
            resultado.push({ categoria: 'Total', datos: datosTotal });

            // Obtener datos por cada categoría
            for (const cat of categorias) {
                const datosCategoria = [];
                for (const periodo of mesesData) {
                    const mesStr = periodo.mes.toString().padStart(2, '0');
                    const añoStr = periodo.año.toString();
                    const totalCat = await database.getFirstAsync(
                        `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                         WHERE usuario_email = ? 
                         AND categoria = ?
                         AND tipo IN ('Gasto', 'Pago', 'Egreso')
                         AND strftime('%m', fecha) = ?
                         AND strftime('%Y', fecha) = ?`,
                        [usuarioEmail.toLowerCase(), cat.categoria, mesStr, añoStr]
                    );
                    datosCategoria.push(Math.round(totalCat?.total || 0));
                }
                if (datosCategoria.some(d => d > 0)) {
                    resultado.push({ categoria: cat.categoria, datos: datosCategoria });
                }
            }
        } else if (tipoTiempo === 'Trimestral') {
            // 4 trimestres del año seleccionado
            const añoTrimestre = rangoData?.año || año;
            const trimestres = [
                { inicio: '01', fin: '03' }, // Q1
                { inicio: '04', fin: '06' }, // Q2
                { inicio: '07', fin: '09' }, // Q3
                { inicio: '10', fin: '12' }  // Q4
            ];

            // Obtener total general por trimestre
            const datosTotal = [];
            for (const trim of trimestres) {
                const totalTrim = await database.getFirstAsync(
                    `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                     WHERE usuario_email = ? 
                     AND tipo IN ('Gasto', 'Pago', 'Egreso')
                     AND strftime('%m', fecha) BETWEEN ? AND ?
                     AND strftime('%Y', fecha) = ?`,
                    [usuarioEmail.toLowerCase(), trim.inicio, trim.fin, añoTrimestre.toString()]
                );
                datosTotal.push(Math.round(totalTrim?.total || 0));
            }
            resultado.push({ categoria: 'Total', datos: datosTotal });

            // Obtener datos por cada categoría
            for (const cat of categorias) {
                const datosCategoria = [];
                for (const trim of trimestres) {
                    const totalCat = await database.getFirstAsync(
                        `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                         WHERE usuario_email = ? 
                         AND categoria = ?
                         AND tipo IN ('Gasto', 'Pago', 'Egreso')
                         AND strftime('%m', fecha) BETWEEN ? AND ?
                         AND strftime('%Y', fecha) = ?`,
                        [usuarioEmail.toLowerCase(), cat.categoria, trim.inicio, trim.fin, añoTrimestre.toString()]
                    );
                    datosCategoria.push(Math.round(totalCat?.total || 0));
                }
                if (datosCategoria.some(d => d > 0)) {
                    resultado.push({ categoria: cat.categoria, datos: datosCategoria });
                }
            }
        } else if (tipoTiempo === 'Anual') {
            // 5 años terminando en el año seleccionado
            const añoFin = rangoData?.añoFin || año;
            const años = [];
            for (let i = 4; i >= 0; i--) {
                años.push((añoFin - i).toString());
            }

            // Obtener total general por año
            const datosTotal = [];
            for (const añoData of años) {
                const totalAño = await database.getFirstAsync(
                    `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                     WHERE usuario_email = ? 
                     AND tipo IN ('Gasto', 'Pago', 'Egreso')
                     AND strftime('%Y', fecha) = ?`,
                    [usuarioEmail.toLowerCase(), añoData]
                );
                datosTotal.push(Math.round(totalAño?.total || 0));
            }
            resultado.push({ categoria: 'Total', datos: datosTotal });

            // Obtener datos por cada categoría
            for (const cat of categorias) {
                const datosCategoria = [];
                for (const añoData of años) {
                    const totalCat = await database.getFirstAsync(
                        `SELECT COALESCE(SUM(monto), 0) as total FROM transacciones 
                         WHERE usuario_email = ? 
                         AND categoria = ?
                         AND tipo IN ('Gasto', 'Pago', 'Egreso')
                         AND strftime('%Y', fecha) = ?`,
                        [usuarioEmail.toLowerCase(), cat.categoria, añoData]
                    );
                    datosCategoria.push(Math.round(totalCat?.total || 0));
                }
                if (datosCategoria.some(d => d > 0)) {
                    resultado.push({ categoria: cat.categoria, datos: datosCategoria });
                }
            }
        }

        return resultado;
    } catch (error) {
        return [];
    }
};

// Función para obtener transacciones del mes actual (mejorada para diciembre)
export const obtenerTransaccionesDelMesActual = async (usuarioEmail) => {
    try {
        const database = await getDB();
        const now = new Date();
        // Usar diciembre (12) como mes predeterminado
        const mes = '12';
        const año = now.getFullYear().toString();

        const result = await database.getAllAsync(
            `SELECT * FROM transacciones 
             WHERE usuario_email = ? 
             AND strftime('%m', fecha) = ? 
             AND strftime('%Y', fecha) = ?
             ORDER BY fecha DESC`,
            [usuarioEmail.toLowerCase(), mes, año]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// ============ PRESUPUESTOS ============

export const guardarPresupuesto = async (presupuesto, usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.runAsync(
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
        return { success: false };
    }
};

export const obtenerPresupuestos = async (usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? ORDER BY fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

export const obtenerPresupuestosPorMes = async (usuarioEmail, mes, año) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND mes = ? AND año = ?',
            [usuarioEmail.toLowerCase(), mes, año]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

export const actualizarPresupuesto = async (id, presupuesto) => {
    try {
        const database = await getDB();
        await database.runAsync(
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
        return { success: false };
    }
};

export const eliminarPresupuesto = async (id) => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM presupuestos WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

export const obtenerPresupuestoPorCategoria = async (usuarioEmail, categoria, mes, año) => {
    try {
        const database = await getDB();
        const result = await database.getFirstAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND categoria = ? AND mes = ? AND año = ?',
            [usuarioEmail.toLowerCase(), categoria, mes, año]
        );
        return result;
    } catch (error) {
        return null;
    }
};

// Función para verificar si se excedió el presupuesto
export const verificarPresupuestoExcedido = async (usuarioEmail, categoria, mes, año) => {
    try {
        const presupuesto = await obtenerPresupuestoPorCategoria(usuarioEmail, categoria, mes, año);

        if (!presupuesto) {
            return { excedido: false };
        }

        const database = await getDB();
        const mesPadded = mes.padStart(2, '0');

        const gastosCategoria = await database.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND categoria = ? AND tipo IN ('Gasto', 'Pago')
       AND strftime('%m', fecha) = ? AND strftime('%Y', fecha) = ?`,
            [usuarioEmail.toLowerCase(), categoria, mesPadded, año]
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
        return { excedido: false };
    }
};

export const obtenerPresupuestosPorCategoria = async (usuarioEmail, categoria) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM presupuestos WHERE usuario_email = ? AND categoria = ? ORDER BY año DESC, mes DESC',
            [usuarioEmail.toLowerCase(), categoria]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// ============ CUENTAS Y CATEGORÍAS ============

// Obtener cuentas de usuario desde la base de datos
export const obtenerCuentasUsuario = async (usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM cuentas WHERE usuario_email = ? ORDER BY fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        return [];
    }
};

// Guardar una nueva cuenta
export const guardarCuenta = async (cuenta, usuarioEmail) => {
    try {
        const database = await getDB();
        const result = await database.runAsync(
            `INSERT INTO cuentas (usuario_email, nombre, tipo, saldo, icono, presupuesto, gastado) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioEmail.toLowerCase(),
                cuenta.nombre,
                cuenta.tipo || 'debito',
                parseFloat(cuenta.saldo) || 0,
                cuenta.icono || 'wallet',
                parseFloat(cuenta.presupuesto) || 0,
                parseFloat(cuenta.gastado) || 0
            ]
        );
        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        return { success: false };
    }
};

// Actualizar una cuenta existente
export const actualizarCuenta = async (id, cuenta) => {
    try {
        const database = await getDB();
        await database.runAsync(
            `UPDATE cuentas 
       SET nombre = ?, tipo = ?, saldo = ?, icono = ?, presupuesto = ?, gastado = ? 
       WHERE id = ?`,
            [
                cuenta.nombre,
                cuenta.tipo || 'debito',
                parseFloat(cuenta.saldo) || 0,
                cuenta.icono || 'wallet',
                parseFloat(cuenta.presupuesto) || 0,
                parseFloat(cuenta.gastado) || 0,
                id
            ]
        );
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

// Eliminar una cuenta
export const eliminarCuenta = async (id) => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM cuentas WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

// Actualizar el saldo de una cuenta
export const actualizarSaldoCuenta = async (id, nuevoSaldo) => {
    try {
        const database = await getDB();
        await database.runAsync(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [parseFloat(nuevoSaldo), id]
        );
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

// Actualizar el gasto de una cuenta con presupuesto
export const actualizarGastoCuenta = async (id, nuevoGasto) => {
    try {
        const database = await getDB();
        await database.runAsync(
            'UPDATE cuentas SET gastado = ? WHERE id = ?',
            [parseFloat(nuevoGasto), id]
        );
        return { success: true };
    } catch (error) {
        return { success: false };
    }
};

// Realizar transferencia entre cuentas
export const realizarTransferencia = async (transferencia, usuarioEmail) => {
    try {
        if (!usuarioEmail) {
            throw new Error('No hay usuario activo');
        }

        const database = await getDB();
        if (!database) {
            throw new Error('Base de datos no inicializada');
        }

        const { monto, cuentaOrigen, cuentaDestino, descripcion, fecha_transaccion, notas } = transferencia;

        // Validar que las cuentas sean diferentes
        if (cuentaOrigen === cuentaDestino) {
            return { success: false, error: 'La cuenta origen y destino deben ser diferentes' };
        }

        // Obtener cuenta origen
        const cuentaOrigenData = await database.getFirstAsync(
            'SELECT * FROM cuentas WHERE nombre = ? AND usuario_email = ?',
            [cuentaOrigen, usuarioEmail.toLowerCase()]
        );

        if (!cuentaOrigenData) {
            return { success: false, error: 'Cuenta origen no encontrada' };
        }

        // Verificar saldo suficiente
        if (parseFloat(cuentaOrigenData.saldo) < parseFloat(monto)) {
            return { success: false, error: 'Saldo insuficiente en la cuenta origen' };
        }

        // Obtener cuenta destino
        const cuentaDestinoData = await database.getFirstAsync(
            'SELECT * FROM cuentas WHERE nombre = ? AND usuario_email = ?',
            [cuentaDestino, usuarioEmail.toLowerCase()]
        );

        if (!cuentaDestinoData) {
            return { success: false, error: 'Cuenta destino no encontrada' };
        }

        // Calcular nuevos saldos
        const nuevoSaldoOrigen = parseFloat(cuentaOrigenData.saldo) - parseFloat(monto);
        const nuevoSaldoDestino = parseFloat(cuentaDestinoData.saldo) + parseFloat(monto);

        // Actualizar saldo de cuenta origen (restar)
        await database.runAsync(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [nuevoSaldoOrigen, cuentaOrigenData.id]
        );

        // Actualizar saldo de cuenta destino (sumar)
        await database.runAsync(
            'UPDATE cuentas SET saldo = ? WHERE id = ?',
            [nuevoSaldoDestino, cuentaDestinoData.id]
        );

        // Guardar la transacción de transferencia
        const result = await database.runAsync(
            `INSERT INTO transacciones (usuario_email, tipo, monto, categoria, descripcion, fecha_transaccion, fecha_pago, cuenta, notas, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioEmail.toLowerCase(),
                'Transferencia',
                parseFloat(monto),
                'Transferencia',
                descripcion || `Transferencia de ${cuentaOrigen} a ${cuentaDestino}`,
                fecha_transaccion,
                fecha_transaccion,
                `${cuentaOrigen} → ${cuentaDestino}`,
                notas || '',
                fecha_transaccion
            ]
        );

        return {
            success: true,
            id: result.lastInsertRowId,
            saldoOrigen: nuevoSaldoOrigen,
            saldoDestino: nuevoSaldoDestino
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

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