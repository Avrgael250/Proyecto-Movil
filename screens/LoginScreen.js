import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { validarCredenciales, guardarSesion } from '../database/database';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const emailRegex = /^(?:[0-9]{9}@upq\.edu\.mx|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const handleLogin = async () => {
    if (!emailRegex.test(email.trim().toLowerCase())) {
      Alert.alert("Correo inválido", "Ingresa un correo válido o institucional @upq.edu.mx");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Error", "Ingresa tu contraseña");
      return;
    }

    const usuario = await validarCredenciales(email, password);
    if (!usuario) {
      Alert.alert("Error", "Correo o contraseña incorrectos");
      return;
    }

    await guardarSesion(email);

    navigation.reset({
      index: 0,
      routes: [{ name: "HomeTabs" }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPass}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
          <Ionicons
            name={showPass ? 'eye-off' : 'eye'}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleLogin}>
        <Text style={styles.btnText}>Ingresar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("RecuperarContrasena")}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Crear una cuenta nueva</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#E3F2FD' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  passwordInput: { flex: 1, padding: 12 },
  btn: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 10,
    marginTop: 10
  },
  btnText: { textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 15, color: '#0d47a1', fontSize: 16 }
});
