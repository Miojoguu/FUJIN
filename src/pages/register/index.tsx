import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { styles } from "./styles";
import logo from "../../assets/logo.png";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { registerRequest } from "../../services/authService";

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      await registerRequest(name, email, password);

      Alert.alert("Sucesso", "Cadastro realizado! Faça login agora.");

      navigation.dispatch(
        CommonActions.navigate({ name: "Login" })
      );
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.error || "Falha no cadastro");
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="height" style={{ flex: 1, width: "100%" }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image style={styles.logoImage} source={logo} />
            </View>

            {/* Título */}
            <Text style={styles.title}>Crie sua conta</Text>

            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            {/* Botão Cadastrar */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Já tem conta? </Text>
              <TouchableOpacity
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.navigate({ name: "Login" })
                  )
                }
              >
                <Text style={styles.createAccountText}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

export default RegisterScreen;
