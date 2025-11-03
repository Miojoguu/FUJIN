// src/services/api.ts
import axios from "axios";

// 1. Lê a variável de ambiente
const API_URL = process.env.EXPO_PUBLIC_API_URL;

// 2. (Boa prática) Adiciona uma verificação para falhar rápido
if (!API_URL) {
  throw new Error(
    "A variável de ambiente EXPO_PUBLIC_API_URL não está definida. Verifique seu .env e reinicie o servidor."
  );
}

const api = axios.create({
  baseURL: API_URL,
});

export default api;
