import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

interface User {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInWithTwitter: (code: string, codeVerifier: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = await AsyncStorage.getItem("@WeatherApp:token");
      const storedUser = await AsyncStorage.getItem("@WeatherApp:user");

      if (storedToken && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  const setAuthenticatedState = async (apiToken: string, apiUser: User) => {
    setToken(apiToken);
    setUser(apiUser);

    api.defaults.headers.common["Authorization"] = `Bearer ${apiToken}`;

    await AsyncStorage.setItem("@WeatherApp:token", apiToken);
    await AsyncStorage.setItem("@WeatherApp:user", JSON.stringify(apiUser));
  };

  const signInEmail = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token: apiToken, user: apiUser } = response.data;

    await setAuthenticatedState(apiToken, apiUser);
  };

  const signInWithTwitter = async (code: string, codeVerifier: string) => {
    const response = await api.post("/auth/twitter/callback", {
      code,
      codeVerifier,
    });
    const { token: apiToken, user: apiUser } = response.data;

    await setAuthenticatedState(apiToken, apiUser);
  };

  const signUp = async (name: string, email: string, password: string) => {
    await api.post("/users", { name, email, password });

    await signInEmail(email, password);
  };

  const signOut = async () => {
    await AsyncStorage.clear();

    setUser(null);
    setToken(null);

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

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
