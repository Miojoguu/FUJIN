// src/services/cacheRefreshService.ts
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { updateCacheForLocation } from "./weatherCacheService";

const prisma = new PrismaClient();

/**
 * Esta função é o "Job 1".
 * Ela busca TODAS as localizações e chama o serviço de atualização
 * para cada uma delas.
 */
const runCacheUpdate = async () => {
  console.log(
    `[${new Date().toISOString()}] Iniciando Job 1: Atualização de Cache...`
  );

  // 1. Busca todos os locais salvos no banco
  const locations = await prisma.userLocation.findMany({
    select: { id: true, name: true }, // Só precisamos do ID e nome (para log)
  });

  console.log(`Encontradas ${locations.length} localizações para atualizar.`);

  // 2. Passa por cada local, um de cada vez
  for (const location of locations) {
    try {
      console.log(`Atualizando cache para: ${location.name} (${location.id})`);
      await updateCacheForLocation(location.id);
      console.log(`Cache para ${location.name} atualizado.`);

      // IMPORTANTE: Adiciona um delay de 5 segundos
      // para não estourar os limites da API de clima.
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 segundos
    } catch (error: any) {
      console.error(
        `Falha ao atualizar cache para ${location.name}: ${error.message}`
      );
      // Continua para o próximo local mesmo se um falhar
    }
  }

  console.log(
    `[${new Date().toISOString()}] Job 1: Atualização de Cache concluída.`
  );
};

/**
 * Inicia o "motor" (Cron Job).
 * Roda a função 'runCacheUpdate' a cada 30 minutos.
 */
export const startCacheRefreshService = () => {
  console.log(
    "Serviço de Atualização de Cache (Job 1) iniciado. Rodando a cada 30 minutos."
  );

  // '*/30 * * * *' = A cada 30 minutos
  cron.schedule("*/30 * * * *", runCacheUpdate, {
    // [CORREÇÃO] Removida a linha 'runOnInit' que causava o erro.
    timezone: "America/Sao_Paulo", // Ajuste para seu fuso horário
  });

  // [CORREÇÃO] Esta é a forma correta de rodar na inicialização.
  // Chama a função manualmente uma vez quando o servidor liga.
  runCacheUpdate();
};
