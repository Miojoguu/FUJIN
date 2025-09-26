import React, { createContext, useState, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginRequest } from "../services/authService";

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginSocialMedia: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) setToken(storedToken);
    };
    loadToken();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setToken(data.token);
    await AsyncStorage.setItem("token", data.token);
  };

  const loginSocialMedia = async (token: string) => {
    const data = ""
    setToken(token);
    await AsyncStorage.setItem("token", token);
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loginSocialMedia }}>
      {children}
    </AuthContext.Provider>
  );
};
