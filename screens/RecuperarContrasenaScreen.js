import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { obtenerUsuarioPorEmail } from '../database/database';

export default function RecuperarContrasenaScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const emailRegex = /^(?:[0-9]{9}@upq\.edu\.mx|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const handleEnviar = async () => {
    if (!emailRegex.test(email.trim().toLowerCase())) {
      Alert.alert("Correo inválido", "Ingresa un correo válido o institucional @upq.edu.mx");
      return;
    }

    const usuario = await obtenerUsuarioPorEmail(email);

    if (!usuario) {
      Alert.alert("Error", "No existe una cuenta con este correo");
      return;
    }

    navigation.navigate("ResetPassword", { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Contraseña</Text>

      <TextInput
        style={styles.input}
        placeholder="Correo registrado"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.btn} onPress={handleEnviar}>
        <Text style={styles.btnText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Volver al login</Text>
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
  btn: { backgroundColor: '#2196F3', padding: 14, borderRadius: 10, marginTop: 10 },
  btnText: { textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 15, color: '#0d47a1', fontSize: 16 }
});
