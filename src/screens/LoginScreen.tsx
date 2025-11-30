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
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

import { StyledInput } from "../components/StyledInput";
import { StyledButton } from "../components/StyledButton";
import { useAuth } from "../contexts/AuthContext";
import { generateCodeVerifier } from "../services/pkce";

const CLIENT_ID = process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID;
const CALLBACK_URL = process.env.EXPO_PUBLIC_TWITTER_CALLBACK_URL;

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);

  const { signInEmail, signInWithTwitter } = useAuth();
  const navigation = useNavigation<any>();

  const handleLoginEmail = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha e-mail e senha.");
      return;
    }
    setLoadingEmail(true);
    try {
      await signInEmail(email, password);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error || "Erro desconhecido. Tente novamente.";
      Alert.alert("Falha no Login", errorMsg);
    } finally {
      setLoadingEmail(false);
    }
  };

  const [showWebView, setShowWebView] = useState(false);
  const [twitterAuthUrl, setTwitterAuthUrl] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [loadingSocial, setLoadingSocial] = useState(false);

  const handleTwitterLogin = () => {
    if (!CLIENT_ID || !CALLBACK_URL) {
      Alert.alert(
        "Erro de Configuração",
        "Variáveis de ambiente do Twitter (CLIENT_ID ou CALLBACK_URL) não encontradas. Verifique seu .env e reinicie o app."
      );
      return;
    }

    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);

    const challenge = verifier;
    const scope = "users.read tweet.read offline.access";
    const state = Math.random().toString(36).substring(2);

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
      CALLBACK_URL
    )}&scope=${encodeURIComponent(
      scope
    )}&state=${state}&code_challenge=${challenge}&code_challenge_method=plain`;

    setTwitterAuthUrl(url);
    setShowWebView(true);
  };

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    if (url.startsWith(CALLBACK_URL)) {
      const codeMatch = url.match(/code=([^&]+)/);

      if (codeMatch) {
        const code = codeMatch[1];
        setShowWebView(false);
        setLoadingSocial(true);

        try {
          await signInWithTwitter(code, codeVerifier);
        } catch (err: any) {
          console.error(err.response?.data || err.message);
          Alert.alert("Erro", "Falha ao logar com X.");
        } finally {
          setLoadingSocial(false);
        }
      }
    }
  };

  if (showWebView) {
    return (
      <Modal
        visible={showWebView}
        animationType="slide"
        onRequestClose={() => setShowWebView(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: "#15202b" }}>
          <WebView
            source={{ uri: twitterAuthUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            startInLoadingState
            style={{ flex: 1 }}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          {(loadingEmail || loadingSocial) && (
            <ActivityIndicator
              size="large"
              color="#3b82f6"
              style={styles.loadingIndicator}
            />
          )}

          <Image
            source={require("../assets/logo-weather.png")}
            style={styles.logo}
          />

          <Text style={styles.title}>Bem vindo de volta!</Text>

          <StyledInput
            placeholder="Seu e-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <StyledInput
            placeholder="Sua senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <StyledButton
            title="Entrar"
            onPress={handleLoginEmail}
            loading={loadingEmail}
          />

          <Text style={styles.separatorText}>Ou logue com</Text>

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <FontAwesome name="facebook" size={24} color="#4267B2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleTwitterLogin}
              disabled={loadingSocial}
            >
              <FontAwesome name="twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
            <Text style={styles.signupText}>
              Não tem conta? <Text style={styles.signupLink}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

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
  loadingIndicator: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.5)",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
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
  separatorText: {
    fontSize: 14,
    color: "#888",
    marginVertical: 20,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
    marginBottom: 30,
  },
  socialButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    color: "#555",
  },
  signupLink: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
});
