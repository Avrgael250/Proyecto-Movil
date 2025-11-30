import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { actualizarPassword } from '../database/database';

export default function ResetPasswordScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { email } = route.params;

  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const manejarCambio = async () => {
    if (!password1.trim() || !password2.trim()) {
      Alert.alert('ERROR', 'Llena todos los campos');
      return;
    }

    if (password1 !== password2) {
      Alert.alert('ERROR', 'Las contraseñas no coinciden');
      return;
    }

    const resultado = await actualizarPassword(email, password1);

    if (resultado.success) {
      Alert.alert(
        'Éxito',
        'Tu contraseña ha sido actualizada',
        [{ text: 'OK', onPress: () => navigation.replace('Login') }]
      );
    } else {
      Alert.alert('ERROR', 'No se pudo actualizar la contraseña');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Restablecer Contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Nueva contraseña"
        secureTextEntry
        value={password1}
        onChangeText={setPassword1}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={password2}
        onChangeText={setPassword2}
      />

      <TouchableOpacity style={styles.button} onPress={manejarCambio}>
        <Text style={styles.buttonText}>Guardar nueva contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Cancelar</Text>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    width: '90%',
    backgroundColor: '#4A8FE7',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#4A8FE7',
  },
});
