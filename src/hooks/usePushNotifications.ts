import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";


const PROJECT_ID = "f696848f-0b40-491c-9862-eed49599ed4c";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    console.log("Notificações não funcionam em emuladores.");
    return null;
  }

  let token;


  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Alert.alert("Falha", "Permissão de notificação negada!");
    return null;
  }

  try {

    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: PROJECT_ID,
      })
    ).data;
    console.log("🔔 TOKEN GERADO COM SUCESSO:", token);
  } catch (e) {
    console.error("Erro ao obter token:", e);
  }

  return token;
}

export function usePushNotifications() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {

          api
            .put(`/users/${user.id}/push-token`, { pushToken: token })
            .then(() => console.log("Token salvo no backend"))
            .catch((err) =>
              console.error("Erro API salvar token:", err.message)
            );
        }
      });
    }
  }, [user]);
}
