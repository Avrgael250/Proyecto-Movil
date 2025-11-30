import * as SQLite from 'expo-sqlite';

let db = null;
let dbPromise = null;

// Función auxiliar para asegurar que la DB está inicializada
const getDB = async () => {
    if (db) {
        return db;
    }

    if (dbPromise) {
        return await dbPromise;
    }

    dbPromise = SQLite.openDatabaseAsync('ahorraplus.db');
    db = await dbPromise;
    dbPromise = null;
    return db;
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
            console.log('✅ Columna fecha_transaccion agregada');
        } catch (error) {
            // Si ya existe, ignorar el error
            if (!error.message.includes('duplicate column')) {
                console.log('ℹ️ Columna fecha_transaccion ya existe');
            }
        }

        try {
            // Intentar agregar fecha_pago si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN fecha_pago TEXT`);
            console.log('✅ Columna fecha_pago agregada');
        } catch (error) {
            // Si ya existe, ignorar el error
            if (!error.message.includes('duplicate column')) {
                console.log('ℹ️ Columna fecha_pago ya existe');
            }
        }

        try {
            // Intentar agregar cuenta si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN cuenta TEXT`);
            console.log('✅ Columna cuenta agregada');
        } catch (error) {
            // Si ya existe, ignorar el error
            if (!error.message.includes('duplicate column')) {
                console.log('ℹ️ Columna cuenta ya existe');
            }
        }

        try {
            // Intentar agregar notas si no existe
            await db.execAsync(`ALTER TABLE transacciones ADD COLUMN notas TEXT`);
            console.log('✅ Columna notas agregada');
        } catch (error) {
            // Si ya existe, ignorar el error
            if (!error.message.includes('duplicate column')) {
                console.log('ℹ️ Columna notas ya existe');
            }
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
        console.error('Error al registrar usuario:', error);
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
        console.error('Error al validar credenciales:', error);
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
        console.error('Error al obtener usuario:', error);
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
        console.error('Error al actualizar contraseña:', error);
        return { success: false };
    }
};

export const obtenerTodosLosUsuarios = async () => {
    try {
        const database = await getDB();
        const result = await database.getAllAsync('SELECT email FROM usuarios');
        return result || [];
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
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
        console.error('Error al guardar sesión:', error);
        return false;
    }
};

export const obtenerSesion = async () => {
    try {
        const database = await getDB();
        const result = await database.getFirstAsync('SELECT * FROM sesion_activa WHERE id = 1');

        if (!result) {
            console.log('⚠️ No hay sesión activa. Por favor inicia sesión en la app.');
        } else {
            console.log('✅ Sesión activa:', result.usuario_email);
        }

        return result;
    } catch (error) {
        console.error('❌ Error al obtener sesión:', error);
        return null;
    }
};

export const cerrarSesion = async () => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM sesion_activa');
        return true;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
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
            console.log('✅ Ya hay sesión activa:', sesion.usuario_email);
            return sesion;
        }

        // Si no hay sesión, buscar cualquier usuario en la DB
        const todosLosUsuarios = await database.getAllAsync('SELECT * FROM usuarios LIMIT 1');

        if (todosLosUsuarios && todosLosUsuarios.length > 0) {
            const usuario = todosLosUsuarios[0];
            console.log('🔧 Creando sesión automática para:', usuario.email);
            await guardarSesion(usuario.email);
            const nuevaSesion = await obtenerSesion();
            console.log('✅ Sesión de prueba creada para:', usuario.email);
            return nuevaSesion;
        }

        // Si no hay usuarios, crear uno de prueba
        console.log('📝 No hay usuarios. Creando usuario de prueba...');
        const emailPrueba = '124051493@gmail.com';
        const passwordPrueba = '123456';

        await database.runAsync(
            'INSERT OR IGNORE INTO usuarios (email, password) VALUES (?, ?)',
            [emailPrueba, passwordPrueba]
        );

        console.log('✅ Usuario de prueba creado:', emailPrueba);
        await guardarSesion(emailPrueba);

        const nuevaSesion = await obtenerSesion();
        console.log('✅ Sesión iniciada automáticamente para:', emailPrueba);
        return nuevaSesion;
    } catch (error) {
        console.error('❌ Error al verificar sesión de prueba:', error);
        return null;
    }
};

// ============ TRANSACCIONES ============

export const guardarTransaccion = async (transaccion, usuarioEmail) => {
    try {
        console.log('💾 Intentando guardar transacción...', transaccion);

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
        console.log('📝 Guardando transacción en BD...');
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

        console.log('✅ Transacción guardada con ID:', result.lastInsertRowId);

        // 2. Actualizar el saldo de la cuenta automáticamente
        if (transaccion.cuenta && transaccion.cuenta !== 'Sin cuenta') {
            console.log('💳 Actualizando saldo de cuenta:', transaccion.cuenta);
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
                    console.log(`💸 Gasto de $${monto} - Saldo anterior: $${cuenta.saldo} → Nuevo saldo: $${nuevoSaldo}`);
                } else if (transaccion.tipo === 'Ingreso' || transaccion.tipo === 'Reembolso') {
                    nuevoSaldo += monto; // Suma para ingresos y reembolsos
                    console.log(`💰 Ingreso de $${monto} - Saldo anterior: $${cuenta.saldo} → Nuevo saldo: $${nuevoSaldo}`);
                }

                // Guardar el nuevo saldo
                await database.runAsync(
                    'UPDATE cuentas SET saldo = ? WHERE id = ?',
                    [nuevoSaldo, cuenta.id]
                );

                console.log(`✅ Saldo de "${transaccion.cuenta}" actualizado a $${nuevoSaldo.toFixed(2)}`);
            } else {
                console.log('⚠️ Cuenta no encontrada:', transaccion.cuenta);
            }
        }

        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        console.error('❌ Error completo al guardar transacción:', error);
        console.error('Stack:', error.stack);
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
        console.error('Error al obtener transacciones:', error);
        return [];
    }
};

export const actualizarTransaccion = async (id, transaccion) => {
    try {
        const database = await getDB();
        await database.runAsync(
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
        const database = await getDB();
        await database.runAsync('DELETE FROM transacciones WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
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
        console.error('Error al obtener transacciones por categoría:', error);
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
        console.error('Error al obtener transacciones por fecha:', error);
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
        console.error('Error al obtener transacciones por tipo:', error);
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
        console.error('Error al obtener resumen por categoría:', error);
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
       WHERE usuario_email = ? AND tipo IN ('Gasto', 'Pago', 'Reembolso') 
       GROUP BY categoria`,
            [usuarioEmail.toLowerCase()]
        );
        return result || [];
    } catch (error) {
        console.error('Error al obtener resumen de egresos:', error);
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
        console.error('Error al obtener transacciones del mes:', error);
        return [];
    }
};

// Función para obtener totales por tipo y mes
export const obtenerTotalesPorMes = async (usuarioEmail, mes, año) => {
    try {
        const database = await getDB();
        const ingresos = await database.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND tipo = 'Ingreso'
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
        console.error('Error al obtener totales por mes:', error);
        return { ingresos: 0, egresos: 0 };
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
        console.error('Error al guardar presupuesto:', error);
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
        console.error('Error al obtener presupuestos:', error);
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
        console.error('Error al obtener presupuestos del mes:', error);
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
        console.error('Error al actualizar presupuesto:', error);
        return { success: false };
    }
};

export const eliminarPresupuesto = async (id) => {
    try {
        const database = await getDB();
        await database.runAsync('DELETE FROM presupuestos WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Error al eliminar presupuesto:', error);
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
        console.error('Error al obtener presupuesto por categoría:', error);
        return null;
    }
};

// Función para verificar si se excedió el presupuesto
export const verificarPresupuestoExcedido = async (usuarioEmail, categoria, mes, año) => {
    try {
        const presupuesto = await obtenerPresupuestoPorCategoria(usuarioEmail, categoria, mes, año);
        if (!presupuesto) return { excedido: false };

        const database = await getDB();
        const gastosCategoria = await database.getFirstAsync(
            `SELECT SUM(monto) as total FROM transacciones 
       WHERE usuario_email = ? AND categoria = ? AND tipo IN ('Gasto', 'Pago')
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
        const database = await getDB();
        const result = await database.getAllAsync(
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

// Obtener cuentas de usuario desde la base de datos
export const obtenerCuentasUsuario = async (usuarioEmail) => {
    try {
        console.log('🔍 Buscando cuentas para:', usuarioEmail);
        const database = await getDB();
        const result = await database.getAllAsync(
            'SELECT * FROM cuentas WHERE usuario_email = ? ORDER BY fecha_creacion DESC',
            [usuarioEmail.toLowerCase()]
        );
        console.log('📊 Cuentas encontradas:', result?.length || 0);
        console.log('📝 Datos:', result);
        return result || [];
    } catch (error) {
        console.error('❌ Error al obtener cuentas del usuario:', error);
        return [];
    }
};

// Guardar una nueva cuenta
export const guardarCuenta = async (cuenta, usuarioEmail) => {
    try {
        console.log('💾 Guardando cuenta en DB...');
        console.log('   Usuario:', usuarioEmail);
        console.log('   Cuenta:', cuenta);
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
        console.log('✅ Cuenta guardada con ID:', result.lastInsertRowId);
        return { success: true, id: result.lastInsertRowId };
    } catch (error) {
        console.error('Error al guardar cuenta:', error);
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
        console.error('Error al actualizar cuenta:', error);
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
        console.error('Error al eliminar cuenta:', error);
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
        console.error('Error al actualizar saldo:', error);
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
        console.error('Error al actualizar gasto:', error);
        return { success: false };
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