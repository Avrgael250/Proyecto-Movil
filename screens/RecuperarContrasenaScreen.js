import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { obtenerUsuarioPorEmail } from '../database/database';

export default function RecuperarContrasenaScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo.trim());
  };

  const manejarRecuperacion = async () => {
    if (!validarEmail(email)) {
      Alert.alert('ERROR', 'Ingresa un correo válido');
      return;
    }

    const usuario = await obtenerUsuarioPorEmail(email);

    if (!usuario) {
      Alert.alert('ERROR', 'El correo no está registrado');
      return;
    }

    Alert.alert(
      'Correo encontrado',
      'Ahora puedes restablecer tu contraseña',
      [
        {
          text: 'Continuar',
          onPress: () => navigation.navigate('ResetPassword', { email })
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={manejarRecuperacion}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Volver al inicio de sesión</Text>
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
    marginBottom: 30,
    color: '#030213',
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  button: {
    width: '90%',
    backgroundColor: '#4A8FE7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#4A8FE7',
    fontSize: 16,
  },
});
