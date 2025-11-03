export const transaccionesEjemplo = [
    {
        id:1,
        tipo: 'ingreso',
        monto : 20000,
        categoria: 'Salario',
        descripcion: 'Pago mensual de mi trabajo',
        fecha: '2025-11-01',
        fechaCreacion: new Date('2025-11-01')
    },

    {
        id:2,
        tipo: 'gasto',
        monto : 750,
        categoria: 'Comida',
        descripcion: 'Gasto en supermercado',
        fecha: '2025-11-02',
        fechaCreacion: new Date('2025-11-02')
    },

    {
        id:3,
        tipo: 'gasto',
        monto : 500,
        categoria: 'Transporte',
        descripcion: 'Gasto en gasolina del coche',
        fecha: '2025-11-03',
        fechaCreacion: new Date('2025-11-03')
    },
    
];
export const categorias = [
    {id:1, mobre: 'Salario', tipo: 'ingreso', color: '#22C55E'},
    {id:2, mobre: 'Comida', tipo: 'gasto', color: '#EF4444'},
    {id:3, mobre: 'Transporte', tipo: 'gasto', color: '#F59E0B'},  
    {id:4, mobre: 'Ocio', tipo: 'gasto', color: '#EC4899'},
];        