import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { obtenerUsuarioPorEmail, actualizarPassword } from '../database/database';

export default function RecuperarContraseñaScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const [emailVerificado, setEmailVerificado] = useState(false);

  const validarEmail = (correo) => {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return regex.test(correo.trim());
  };

  const verificarEmail = async () => {
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

    // 🗄️ VERIFICAR SI EL EMAIL EXISTE EN LA BD
    const usuario = await obtenerUsuarioPorEmail(email);

    if (usuario) {
      setEmailVerificado(true);
      if (Platform.OS === 'web') {
        window.alert('Email verificado. Ahora puedes crear una nueva contraseña.');
      } else {
        Alert.alert('Éxito', 'Email verificado. Ahora puedes crear una nueva contraseña.');
      }
    } else {
      if (Platform.OS === 'web') {
        window.alert('Este correo no está registrado.');
      } else {
        Alert.alert('Error', 'Este correo no está registrado.');
      }
    }
  };

  const cambiarPassword = async () => {
    if (!nuevaPassword.trim() || !confirmarPassword.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor completa todos los campos.');
      } else {
        Alert.alert('Error', 'Por favor completa todos los campos.');
      }
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      if (Platform.OS === 'web') {
        window.alert('Las contraseñas no coinciden.');
      } else {
        Alert.alert('Error', 'Las contraseñas no coinciden.');
      }
      return;
    }

    if (nuevaPassword.length < 6) {
      if (Platform.OS === 'web') {
        window.alert('La contraseña debe tener al menos 6 caracteres.');
      } else {
        Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      }
      return;
    }

    // 🗄️ ACTUALIZAR PASSWORD EN SQLITE
    const resultado = await actualizarPassword(email, nuevaPassword);

    if (resultado.success) {
      if (Platform.OS === 'web') {
        window.alert('Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      } else {
        Alert.alert('Éxito', 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
      }
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error al actualizar la contraseña.');
      } else {
        Alert.alert('Error', 'Error al actualizar la contraseña.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>

      {!emailVerificado ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu correo electrónico"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.button} onPress={verificarEmail}>
            <Text style={styles.buttonText}>Verificar correo</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.subtitle}>Crear nueva contraseña para: {email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Nueva contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={nuevaPassword}
            onChangeText={setNuevaPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirmar contraseña"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmarPassword}
            onChangeText={setConfirmarPassword}
          />

          <TouchableOpacity style={styles.button} onPress={cambiarPassword}>
            <Text style={styles.buttonText}>Cambiar contraseña</Text>
          </TouchableOpacity>
        </>
      )}

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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#030213',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#030213',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
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
