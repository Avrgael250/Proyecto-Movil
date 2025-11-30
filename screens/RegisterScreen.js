import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Switch, Platform, StatusBar } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { registrarUsuario } from '../database/database';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceptarCondiciones, setAceptarCondiciones] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  useEffect(() => {
    const hideBars = async () => {
      if (Platform.OS === 'android') {
        await StatusBar.setTranslucent(true);
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay');
        StatusBar.setHidden(true);
      } else StatusBar.setHidden(true, 'fade');
    };
    const showBars = async () => {
      if (Platform.OS === 'android') {
        await StatusBar.setTranslucent(false);
        await NavigationBar.setVisibilityAsync('visible');
        StatusBar.setHidden(false);
      } else StatusBar.setHidden(false, 'fade');
    };
    if (isFocused) hideBars();
    return () => showBars();
  }, [isFocused]);

  const validarEmail = (correo) => {
    const dominiosValidos = ['gmail.com', 'yahoo.com', 'hotmail.com', 'icloud.com', 'outlook.com', 'yamail.com'];
    if (!correo.includes('@')) return false;
    const [_, dominio] = correo.split('@');
    return dominiosValidos.includes(dominio.toLowerCase());
  };

  const mostrarAlerta = (t, m) => Platform.OS === 'web' ? window.alert(`${t}: ${m}`) : Alert.alert(t, m);

  const manejarRegistro = async () => {
    if (!email.trim() || !password.trim() || !confirmar.trim()) return mostrarAlerta('ERROR', 'Por favor llena todos los campos');
    if (!validarEmail(email)) return mostrarAlerta('ERROR', 'Correo no válido');
    if (password !== confirmar) return mostrarAlerta('ERROR', 'Las contraseñas no coinciden');
    if (!aceptarCondiciones) return mostrarAlerta('ERROR', 'Debes aceptar los términos');

    const resultado = await registrarUsuario(email, password);
    if (resultado.success) {
      mostrarAlerta('Bienvenido', 'Tu cuenta ha sido creada');
      navigation.navigate('Login');
    } else mostrarAlerta('ERROR', resultado.error || 'Error');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#999" keyboardType="email-address" value={email} onChangeText={setEmail} />

      <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#999" secureTextEntry={!mostrarPassword} value={password} onChangeText={setPassword} />

      <TextInput style={styles.input} placeholder="Confirmar contraseña" placeholderTextColor="#999" secureTextEntry={!mostrarPassword} value={confirmar} onChangeText={setConfirmar} />

      <View style={styles.switchContainer}>
        <Switch value={mostrarPassword} onValueChange={setMostrarPassword} />
        <Text style={styles.switchText}>Mostrar contraseñas</Text>
      </View>

      <View style={styles.switchContainer}>
        <Switch value={aceptarCondiciones} onValueChange={setAceptarCondiciones} />
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

