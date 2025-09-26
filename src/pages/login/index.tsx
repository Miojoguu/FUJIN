import React, { useState, useContext } from "react";
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
  ActivityIndicator,
} from "react-native";
import { styles } from "./styles";
import logo from "../../assets/logo.png";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { AuthContext } from "../../contexts/AuthContext";
import GoogleButton from "../../components/socialMediaButtons/GoogleButton";
import FacebookButton from "../../components/socialMediaButtons/FacebookButton";
import TwitterButton from "../../components/socialMediaButtons/TwitterButton";
import { WebView } from "react-native-webview";
import { generateCodeVerifier } from "../../services/pkce";
import axios from "axios";
import { TWITTER_CLIENT_ID, TWITTER_CALLBACK_URL, IP_BACKEND } from "../../env";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showWebView, setShowWebView] = useState(false);
  const [twitterAuthUrl, setTwitterAuthUrl] = useState("");
  const [codeVerifier, setCodeVerifier] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginSocialMedia } = useContext(AuthContext);
  const navigation = useNavigation();

  // LOGIN EMAIL
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      await login(email, password);
      navigation.dispatch(CommonActions.navigate({ name: "Weather" }));
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.error || "Falha no login");
      console.error(err);
    }
  };

  // LOGIN TWITTER
  const handleTwitterLogin = () => {
    const verifier = generateCodeVerifier();
    setCodeVerifier(verifier);

    const challenge = verifier; 
    const clientId = TWITTER_CLIENT_ID;
    const redirectUri = TWITTER_CALLBACK_URL;
    const scope = "tweet.read users.read offline.access";
    const state = Math.random().toString(36).substring(2);

    const url = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(
      scope
    )}&state=${state}&code_challenge=${challenge}&code_challenge_method=plain`;

    setTwitterAuthUrl(url);
    setShowWebView(true);
  };

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    if (url.startsWith(TWITTER_CALLBACK_URL)) {
      const codeMatch = url.match(/code=([^&]+)/);
      if (codeMatch) {
        const code = codeMatch[1];
        setShowWebView(false);
        setLoading(true);

        try {
          const response = await axios.post(
            `${IP_BACKEND}/auth/twitter/callback`,
            { code, codeVerifier }
          );
          console.log("Code recebido:", code);
          console.log("CodeVerifier recebido:", codeVerifier);

          const { token } = response.data;
          await loginSocialMedia(token);
          navigation.dispatch(CommonActions.navigate({ name: "Weather" }));
        } catch (err: any) {
          console.error(err.response?.data || err.message);
          Alert.alert("Erro", "Falha ao logar com X");
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (showWebView) {
    return (
      <View style={{ flex: 1 }}>
        <WebView
          source={{ uri: twitterAuthUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" style={{ flex: 1, width: "100%" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image style={styles.logoImage} source={logo} />
          </View>

          <Text style={styles.title}>Bem vindo de volta!</Text>

          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleLogin}
          >
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={{ marginTop: 20, marginBottom: 10, color: "#555" }}>
            Ou logue com
          </Text>

          <View style={styles.socialButtonsContainer}>
            <GoogleButton
              onPress={() => Alert.alert("Login com Google")}
              style={styles.socialButton}
            />
            <FacebookButton
              onPress={() => Alert.alert("Login com Facebook")}
              style={styles.socialButton}
            />
            <TwitterButton
              onPress={handleTwitterLogin}
              style={styles.socialButton}
            />
          </View>

          {loading && (
            <ActivityIndicator
              size="large"
              style={{ position: "absolute", top: "50%", left: "50%" }}
            />
          )}

          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Não tem conta? </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.dispatch(
                  CommonActions.navigate({ name: "Register" })
                )
              }
            >
              <Text style={styles.createAccountText}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
