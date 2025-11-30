import axios from "axios";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "A variável de ambiente EXPO_PUBLIC_API_URL não está definida. Verifique seu .env e reinicie o servidor."
  );
}

const api = axios.create({
  baseURL: API_URL,
  timeout: 5000,
});

export default api;
