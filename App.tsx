// App.tsx (na raiz do projeto)
import React from "react";
import { StatusBar } from "expo-status-bar";

import { AuthProvider } from "./src/contexts/AuthContext";
import { RootNavigator } from "./src/navigation";

export default function App() {
  return (
    // 1. O AuthProvider envolve tudo, fornecendo o contexto
    <AuthProvider>
      <StatusBar style="dark" />

      {/* 2. O RootNavigator decide qual tela mostrar (Auth ou App) */}
      <RootNavigator />
    </AuthProvider>
  );
}
