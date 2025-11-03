// src/hooks/usePushNotifications.ts
import { useState, useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// Configura como o app se comporta quando recebe uma notificação
// (Mesmo se o app estiver aberto)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true, // Mudamos para true para ajudar nos testes
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- FUNÇÃO DE DEPURAÇÃO ---
// Esta função vai listar todos os canais que o 'FUJIN' criou
const checkNotificationChannels = async () => {
  if (Platform.OS === "android") {
    try {
      const channels = await Notifications.getNotificationChannelsAsync();
      console.log("---- CANAIS DE NOTIFICAÇÃO EXISTENTES ----");
      console.log(JSON.stringify(channels, null, 2));
      console.log("------------------------------------------");
    } catch (e) {
      console.error("Falha ao buscar canais de notificação:", e);
    }
  }
};
// --- FIM DA FUNÇÃO DE DEPURAÇÃO ---

// A função principal que pede permissão e pega o token
async function registerForPushNotificationsAsync() {
  let token;
  if (!Device.isDevice) {
    console.warn("Notificações push só funcionam em dispositivos físicos.");
    return;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    console.log("Pedindo permissão de notificação...");
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    console.log("Permissão de notificação negada.");
    return;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token obtido:", token);

  // **** CORREÇÃO CRÍTICA (preenchida) ****
  // Precisamos criar o canal para o Android.
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  // Chama a função de verificação (depuração)
  await checkNotificationChannels();

  return token;
}

// O Hook que nosso app vai usar
export function usePushNotifications() {
  const { user } = useAuth(); // Pega o usuário logado

  useEffect(() => {
    if (user) {
      console.log("Usuário logado, registrando para notificações...");

      registerForPushNotificationsAsync()
        .then((token) => {
          console.log("Hook de notificação: Valor do token recebido:", token);
          if (token) {
            api
              .put(`/users/${user.id}/push-token`, {
                //
                pushToken: token,
              })
              .then(() => {
                console.log("Push token salvo no backend.");
              })
              .catch((err) => {
                console.error(
                  "Falha ao salvar push token:",
                  err.response?.data || err.message
                );
              });
          }
        })
        .catch((error) => {
          // Pega erros do registerForPushNotificationsAsync
          console.error(
            "ERRO AO REGISTRAR NOTIFICAÇÃO (getExpoPushTokenAsync falhou):",
            error
          );
        });
    }
  }, [user]);
}
