import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { actualizarPassword } from '../database/database';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params;

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');

  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const manejarReset = async () => {
    if (!password.trim() || !confirmar.trim()) {
      mostrarAlerta('ERROR', 'Llena ambos campos');
      return;
    }

    if (password !== confirmar) {
      mostrarAlerta('ERROR', 'Las contraseñas no coinciden');
      return;
    }

    await actualizarPassword(email, password);

    mostrarAlerta('Éxito', 'Tu contraseña ha sido actualizada');

    setTimeout(() => {
      navigation.navigate('Login');
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>

      <Text style={styles.subTitle}>Correo:</Text>
      <Text style={styles.emailText}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar nueva contraseña"
        secureTextEntry
        value={confirmar}
        onChangeText={setConfirmar}
      />

      <TouchableOpacity style={styles.button} onPress={manejarReset}>
        <Text style={styles.buttonText}>Actualizar Contraseña</Text>
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
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 16,
    color: '#030213',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A8FE7',
    marginBottom: 20,
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
});
