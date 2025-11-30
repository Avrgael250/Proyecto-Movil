import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet
} from 'react-native';
import { actualizarPassword } from '../database/database';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;

  const [pass1, setPass1] = useState('');
  const [pass2, setPass2] = useState('');
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);

  const handleCambiar = async () => {
    if (!pass1.trim() || !pass2.trim()) {
      Alert.alert("Error", "Llena todos los campos");
      return;
    }

    if (pass1 !== pass2) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    const result = await actualizarPassword(email, pass1);

    if (!result.success) {
      Alert.alert("Error", "No se pudo actualizar la contraseña");
      return;
    }

    Alert.alert("Listo", "Tu contraseña ha sido actualizada");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nueva Contraseña</Text>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Nueva contraseña"
          secureTextEntry={!show1}
          value={pass1}
          onChangeText={setPass1}
        />
        <TouchableOpacity onPress={() => setShow1(!show1)}>
          <Ionicons name={show1 ? 'eye-off' : 'eye'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Repetir contraseña"
          secureTextEntry={!show2}
          value={pass2}
          onChangeText={setPass2}
        />
        <TouchableOpacity onPress={() => setShow2(!show2)}>
          <Ionicons name={show2 ? 'eye-off' : 'eye'} size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleCambiar}>
        <Text style={styles.btnText}>Guardar Contraseña</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Volver al login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 25, backgroundColor: '#E3F2FD' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
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
  btn: { backgroundColor: '#2196F3', padding: 14, borderRadius: 10, marginTop: 10 },
  btnText: { textAlign: 'center', fontSize: 18, color: '#fff', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 15, color: '#0d47a1', fontSize: 16 }
});
