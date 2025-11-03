// src/screens/CadastroScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { StyledInput } from "../components/StyledInput";
import { StyledButton } from "../components/StyledButton";
import { useAuth } from "../contexts/AuthContext";

export function CadastroScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signUp } = useAuth();
  const navigation = useNavigation<any>();

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
      // Se sucesso, o AuthProvider vai atualizar o estado
      // e o navigator principal (em App.tsx) fará o resto.
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Erro desconhecido. Tente novamente.";
      Alert.alert("Falha no Cadastro", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {/* Logo */}
          <Image
            source={require("../assets/logo-weather.png")} // Reutilizando a mesma imagem
            style={styles.logo}
          />

          <Text style={styles.title}>Crie sua conta</Text>

          {/* Formulário de Cadastro */}
          <StyledInput
            placeholder="Nome"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <StyledInput
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <StyledInput
            placeholder="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <StyledButton
            title="Cadastrar"
            onPress={handleSignUp}
            loading={loading}
          />

          {/* Link de Login */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Faça login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

// Reutilizando e adaptando os estilos do LoginScreen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  loginText: {
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  loginLink: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
});
