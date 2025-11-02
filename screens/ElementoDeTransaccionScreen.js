import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ElementoTransaccion = ({ transaccion, alPresionar }) => {
  const esIngreso = transaccion.tipo === 'ingreso';
  
  const obtenerIconoCategoria = (categoria) => {
    const iconos = {
      'Salario': '💰',
      'Freelance': '💻',
      'Comida': '🍕',
      'Transporte': '🚗',
      'Entretenimiento': '🎬'
    };
    return iconos[categoria] || '💳';
  };

  return (
    <TouchableOpacity 
      style={estilos.contenedor}
      onPress={alPresionar}
    >
      <View style={estilos.contenedorIcono}>
        <View style={[
          estilos.fondoIcono,
          { backgroundColor: esIngreso ? '#E0F2FE' : '#FEE2E2' }
        ]}>
          <Text style={estilos.emoji}>
            {obtenerIconoCategoria(transaccion.categoria)}
          </Text>
        </View>
      </View>
      
      <View style={estilos.contenedorInfo}>
        <Text style={estilos.textoCategoria}>{transaccion.categoria}</Text>
        <Text style={estilos.textoDescripcion} numberOfLines={1}>
          {transaccion.descripcion}
        </Text>
        <Text style={estilos.textoFecha}>
          {new Date(transaccion.fecha).toLocaleDateString('es-ES')}
        </Text>
      </View>
      
      <View style={estilos.contenedorMonto}>
        <Text style={[
          estilos.textoMonto,
          { color: esIngreso ? '#0EA5E9' : '#EF4444' }
        ]}>
          {esIngreso ? '+' : '-'} ${transaccion.monto}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const estilos = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contenedorIcono: {
    marginRight: 12,
  },
  fondoIcono: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 20,
  },
  contenedorInfo: {
    flex: 1,
  },
  textoCategoria: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  textoDescripcion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  textoFecha: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contenedorMonto: {
    alignItems: 'flex-end',
  },
  textoMonto: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ElementoTransaccion;