import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function RecuperarContraseñaScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo.trim());
  };

  const manejarRecuperacion = () => {
    if (email.trim() === '') {
      if (Platform.OS === 'web') {
        window.alert('Por favor ingresa tu correo electrónico.');
      } else {
        Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      }
      return;
    }

    if (!validarEmail(email)) {
      if (Platform.OS === 'web') {
        window.alert('El correo ingresado no es válido.');
      } else {
        Alert.alert('Error', 'El correo ingresado no es válido.');
      }
      return;
    }

    if (Platform.OS === 'web') {
      window.alert(`Se ha enviado un enlace de recuperación a ${email}`);
    } else {
      Alert.alert('Correo enviado', `Se ha enviado un enlace de recuperación a ${email}`);
    }

    // Regresa al login
    navigation.goBack(); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu correo electrónico"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.button} onPress={manejarRecuperacion}>
        <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 30,
  },
  input: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    marginTop: 20,
    color: '#4A8FE7',
    fontWeight: '500',
  },
});
