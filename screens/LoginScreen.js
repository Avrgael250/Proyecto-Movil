import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { validarCredenciales, guardarSesion } from '../database/database';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo.trim());
  };

  const manejarLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      if (Platform.OS === 'web') {
        window.alert('ERROR: llena todos los campos antes de continuar');
      } else {
        Alert.alert('ERROR', 'Llena todos los campos antes de continuar');
      }
      return;
    }

    if (!validarEmail(email)) {
      if (Platform.OS === 'web') {
        window.alert('ERROR: el correo está mal escrito.\nDebe contener "@" y un dominio válido (ejemplo@gmail.com)');
      } else {
        Alert.alert('ERROR', 'El correo está mal escrito.\nDebe contener "@" y un dominio válido (ejemplo@gmail.com)');
      }
      return;
    }

    // 🗄️ VALIDAR CREDENCIALES EN SQLITE
    const usuario = await validarCredenciales(email, password);

    if (usuario) {
      console.log('💾 Guardando sesión para:', usuario.email);
      const sesionGuardada = await guardarSesion(usuario.email);
      console.log('✅ Sesión guardada:', sesionGuardada);

      // 👀 VER DATOS EN CONSOLA
      console.log('\n========== LOGIN EXITOSO ==========');
      console.log('✅ Usuario:', usuario.email);
      console.log('📅 Registro:', usuario.fecha_registro);
      console.log('===================================\n');

      if (Platform.OS === 'web') {
        window.alert('BIENVENIDO ' + usuario.email);
      } else {
        Alert.alert('BIENVENIDO', usuario.email);
      }
      // Navegar a Home
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    } else {
      if (Platform.OS === 'web') {
        window.alert('ERROR: Correo o contraseña incorrectos');
      } else {
        Alert.alert('ERROR', 'Correo o contraseña incorrectos');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
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

      <TouchableOpacity style={styles.button} onPress={manejarLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* registro */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>¿No tienes una cuenta? Crear cuenta</Text>
      </TouchableOpacity>

      {/*olvido de contraseña */}
      <TouchableOpacity onPress={() => alert('Funcionalidad próximamente')}>
        <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
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
  forgotText: {
    marginTop: 15,
    color: '#4A8FE7',
    fontWeight: '500',
  },
});
