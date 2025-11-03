// src/contexts/AuthContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// --- Tipagem ---

// Baseado no seu schema.prisma
interface User {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
}

// O que nosso contexto irá fornecer
interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInWithTwitter: (code: string, codeVerifier: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

// Props do nosso Provider
interface AuthProviderProps {
  children: ReactNode;
}

// --- Criação do Contexto ---

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// --- Provider ---

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Efeito para carregar dados salvos ao iniciar o app
  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem("@WeatherApp:token");
      const storedUser = await AsyncStorage.getItem("@WeatherApp:user");

      if (storedToken && storedUser) {
        // Se encontramos, definimos o estado e o header padrão do axios
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  // --- Função Helper Interna ---

  /**
   * Função centralizada para salvar o estado de autenticação
   * (Usada pelo login de email e social)
   */
  const setAuthenticatedState = async (apiToken: string, apiUser: User) => {
    // 1. Atualiza o estado do React
    setToken(apiToken);
    setUser(apiUser);

    // 2. Define o header para todas as futuras requisições axios
    api.defaults.headers.common["Authorization"] = `Bearer ${apiToken}`;

    // 3. Salva no AsyncStorage para persistência
    await AsyncStorage.setItem("@WeatherApp:token", apiToken);
    await AsyncStorage.setItem("@WeatherApp:user", JSON.stringify(apiUser));
  };

  // --- Funções Públicas (disponibilizadas pelo context) ---

  const signInEmail = async (email: string, password: string) => {
    // Chama a rota de login do backend
    const response = await api.post("/auth/login", { email, password });
    const { token: apiToken, user: apiUser } = response.data;

    // Salva o estado
    await setAuthenticatedState(apiToken, apiUser);
  };

  const signInWithTwitter = async (code: string, codeVerifier: string) => {
    // Chama a rota de callback do Twitter no backend
    const response = await api.post("/auth/twitter/callback", {
      code,
      codeVerifier,
    });
    const { token: apiToken, user: apiUser } = response.data;

    // Salva o estado
    await setAuthenticatedState(apiToken, apiUser);
  };

  const signUp = async (name: string, email: string, password: string) => {
    // Passo 1: Chama a rota de criação de usuário (POST /users)
    await api.post("/users", { name, email, password });

    // Passo 2: Se o cadastro foi bem-sucedido, faz o login
    // para obter o token e autenticar o usuário.
    await signInEmail(email, password);
  };

  const signOut = async () => {
    // 1. Limpa o AsyncStorage
    await AsyncStorage.clear();

    // 2. Limpa o estado do React
    setUser(null);
    setToken(null);

    // 3. Limpa o header do axios
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signInEmail,
        signInWithTwitter,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- Hook Customizado ---

/**
 * Hook para acessar facilmente o contexto de autenticação
 */
export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
