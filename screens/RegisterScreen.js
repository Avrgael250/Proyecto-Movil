import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Switch, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceptarCondiciones, setAceptarCondiciones] = useState(false);

  // validacion de correo para que tenga @ y un dominio 
  const validarEmail = (correo) => {
    const dominiosValidos = ['gmail.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'outlook.com', 'yamail.com'];
    if (!correo.includes('@')) return false;
    const partes = correo.split('@');
    if (partes.length !== 2) return false;
    const dominio = partes[1].toLowerCase();
    return dominiosValidos.includes(dominio);
  };

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const manejarRegistro = () => {
    // campos sin llenar
    if (!email.trim() || !password.trim() || !confirmar.trim()) {
      mostrarAlerta('ERROR', 'Por favor llena todos los campos');
      return;
    }

    // correo no valido
    if (!validarEmail(email)) {
      mostrarAlerta('ERROR', 'Correo no válido. Asegúrate de incluir un dominio correcto');
      return;
    }

    // contraseñas no iguales
    if (password !== confirmar) {
      mostrarAlerta('ERROR', 'Las contraseñas no coinciden');
      return;
    }

    // aceptar terminos
    if (!aceptarCondiciones) {
      mostrarAlerta('ERROR', 'Necesitas aceptar los términos y condiciones para continuar');
      return;
    }

    // registro completo
    mostrarAlerta('Bienvenido', 'Tu cuenta ha sido creada correctamente.\nYa puedes ingresar');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmar}
        onChangeText={setConfirmar}
      />

      {/* Switch */}
      <View style={styles.switchContainer}>
        <Switch
          value={aceptarCondiciones}
          onValueChange={setAceptarCondiciones}
          thumbColor={aceptarCondiciones ? '#4A8FE7' : '#ccc'}
          trackColor={{ false: '#ddd', true: '#A7C7F2' }}
        />
        <Text style={styles.switchText}>Aceptar términos y condiciones</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={manejarRegistro}>
        <Text style={styles.buttonText}>Registrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 40,
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
  },
  button: {
    width: '90%',
    backgroundColor: '#4A8FE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 20,
    color: '#4A8FE7',
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '90%',
  },
  switchText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#030213',
  },
});

