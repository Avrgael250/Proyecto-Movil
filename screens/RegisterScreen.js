import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  StyleSheet
} from 'react-native';
import { registrarUsuario } from '../database/database';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  // Acepta correo normal o institucional de la UPQ
  const emailRegex =
    /^(?:[0-9]{9}@upq\.edu\.mx|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  const handleRegister = async () => {
    if (!emailRegex.test(email.trim().toLowerCase())) {
      Alert.alert(
        "Correo inválido",
        "Ingresa un correo válido o un correo institucional @upq.edu.mx"
      );
      return;
    }

    if (!password.trim() || !password2.trim()) {
      Alert.alert("Error", "Llena todos los campos");
      return;
    }

    if (password !== password2) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    if (!aceptaTerminos) {
      Alert.alert(
        "Términos no aceptados",
        "Debes aceptar los términos y condiciones para continuar"
      );
      return;
    }

    const result = await registrarUsuario(email, password);

    if (!result.success) {
      Alert.alert("Error", result.error);
      return;
    }

    Alert.alert("Cuenta creada", "Ahora puedes iniciar sesión");
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      {/* CORREO */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      {/* CONTRASEÑA */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPass1}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPass1(!showPass1)}>
          <Ionicons
            name={showPass1 ? "eye-off" : "eye"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Repetir contraseña"
          secureTextEntry={!showPass2}
          value={password2}
          onChangeText={setPassword2}
        />
        <TouchableOpacity onPress={() => setShowPass2(!showPass2)}>
          <Ionicons
            name={showPass2 ? "eye-off" : "eye"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.terminosContainer}>
        <Switch
          value={aceptaTerminos}
          onValueChange={setAceptaTerminos}
          thumbColor={aceptaTerminos ? "#4A8FE7" : "#ccc"}
          trackColor={{ false: "#ddd", true: "#A7C7F2" }}
        />
        <Text style={styles.terminosText}>
          Aceptar términos y condiciones
        </Text>
      </View>

      {/* BOTÓN REGISTRAR */}
      <TouchableOpacity style={styles.btn} onPress={handleRegister}>
        <Text style={styles.btnText}>Crear Cuenta</Text>
      </TouchableOpacity>

      {/* VOLVER A LOGIN */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Ya tengo una cuenta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 25, backgroundColor: "#E3F2FD" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 25, textAlign: "center" },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc"
  },
  passwordContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 10,
    alignItems: "center",
    marginBottom: 12
  },
  passwordInput: { flex: 1, padding: 12 },

  terminosContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  terminosText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#030213",
  },

  btn: { backgroundColor: "#2196F3", padding: 14, borderRadius: 10, marginTop: 10 },
  btnText: { textAlign: "center", fontSize: 18, color: "#fff", fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 15, color: "#0d47a1", fontSize: 16 }
});

