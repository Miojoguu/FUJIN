import cron from "node-cron";
import { PrismaClient, AlertOperator, UserAlert } from "@prisma/client";

// Importe o Expo
import { Expo } from "expo-server-sdk";

const prisma = new PrismaClient();
// Crie uma instância do Expo
const expo = new Expo();

/**
 * Compara o valor do clima com o valor do alerta.
 */
const compareValues = (
  weatherValue: number,
  operator: AlertOperator,
  alertValue: number
): boolean => {
  switch (operator) {
    case "GT": // Maior que
      return weatherValue > alertValue;
    case "GTE": // Maior ou igual
      return weatherValue >= alertValue;
    case "LT": // Menor que
      return weatherValue < alertValue;
    case "LTE": // Menor ou igual
      return weatherValue <= alertValue;
    case "EQ": // Igual
      return weatherValue === alertValue;
    default:
      return false;
  }
};

/**
 * Função principal que busca e processa todos os alertas.
 */
const checkAlerts = async () => {
  console.log(`[${new Date().toISOString()}] Verificando alertas (Job 2)...`);

  try {
    // Busca todos os alertas cadastrados, incluindo o nome do local
    const allAlerts = await prisma.userAlert.findMany({
      include: {
        location: {
          select: { name: true }, // Inclui dados da localização para a mensagem
        },
      },
    });

    for (const alert of allAlerts) {
      // 2. Para cada alerta, busca o dado de clima MAIS RECENTE no cache
      const latestWeather = await prisma.weatherData.findFirst({
        where: { locationId: alert.locationId },
        orderBy: { timestamp: "desc" },
      });

      if (!latestWeather) {
        continue;
      }

      // 3. Pega dinamicamente o valor a ser testado
      const valueToTest = (latestWeather as any)[alert.type];

      if (valueToTest === null || valueToTest === undefined) {
        console.warn(
          `Tipo de alerta "${alert.type}" não encontrado no WeatherData.`
        );
        continue;
      }

      // 4. Compara os valores
      const ruleMet = compareValues(
        valueToTest as number,
        alert.operator,
        alert.threshold
      );

      // 5. Se a regra foi atendida, dispara a notificação
      if (ruleMet) {
        triggerNotification(
          alert,
          valueToTest as number,
          alert.location.name || "Localização" // Passa o nome do local
        );
      }
    }
  } catch (error: any) {
    console.error(`[CRÍTICO] Job 2 falhou ao buscar alertas: ${error.message}`);
  }
};

/**
 * [TÓPICO 3 ATUALIZADO]
 * Dispara a notificação para o usuário.
 */
const triggerNotification = async (
  alert: UserAlert,
  currentValue: number,
  locationName: string
) => {
  try {
    // 1. Buscar o 'pushToken' do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: alert.userId },
      select: { pushToken: true },
    });

    if (!user || !user.pushToken) {
      console.warn(
        `Usuário ${alert.userId} não possui push token. Alerta não enviado.`
      );
      return;
    }

    const pushToken = user.pushToken;
    const title = `Alerta de Clima: ${locationName}`;
    const message = `Alerta disparado: ${alert.type} está ${alert.operator} ${alert.threshold}. (Valor atual: ${currentValue})`;

    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} não é um token válido do Expo`);
      return;
    }

    // Crie a mensagem
    const messages = [
      {
        to: pushToken,
        sound: "default" as "default",
        title: title,
        body: message,
        data: { locationId: alert.locationId },
        channelId: "default", // Conforme solicitado pelo seu colega de front
      },
    ];

    // [LINHA ADICIONADA] Loga o objeto da mensagem
    console.log("Enviando payload da notificação:", JSON.stringify(messages));

    await expo.sendPushNotificationsAsync(messages);

    console.log(`Notificação para ${alert.userId} enviada com sucesso.`);
  } catch (error: any) {
    console.error(
      `Falha ao enviar notificação para ${alert.userId}: ${error.message}`
    );
  }
};

/**
 * Inicia o "motor" de alertas (Job 2).
 * Roda a função 'checkAlerts' a cada 1 minuto (para testes).
 */
export const startAlertService = () => {
  console.log(
    "Serviço de Alertas (Job 2) iniciado. Verificando a cada 1 minuto (MODO DE TESTE)."
  );

  // '*' = A cada 1 minuto
  cron.schedule("* * * * *", checkAlerts, {
    timezone: "America/Sao_Paulo",
  });
};
