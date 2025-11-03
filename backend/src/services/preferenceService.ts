// src/services/preferenceService.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// [CORREÇÃO] Definimos o tipo para o objeto 'defaults'
// para que o TypeScript saiba que ele corresponde ao tipo de retorno.
const defaults: {
  unitTemp: "C" | "F";
  unitSpeed: "kph" | "mph";
  hourFormat: "h12" | "h24";
} = {
  unitTemp: "C",
  unitSpeed: "mph",
  hourFormat: "h24",
};

/**
 * Busca as preferências de um usuário no banco.
 * Se o userId não for fornecido ou não for encontrado,
 * retorna os padrões do schema.
 */
export async function getPreferences(userId: string | undefined): Promise<{
  unitTemp: "C" | "F";
  unitSpeed: "kph" | "mph";
  hourFormat: "h12" | "h24";
}> {
  if (!userId) {
    return defaults; // Agora isso é válido
  }

  try {
    const preferences = await prisma.userPreference.findUnique({
      where: { userId: userId },
      select: { unitTemp: true, unitSpeed: true, hourFormat: true },
    });

    if (preferences) {
      // Retorna as preferências salvas
      return {
        unitTemp: preferences.unitTemp,
        unitSpeed: preferences.unitSpeed,
        hourFormat: preferences.hourFormat,
      };
    }

    // Usuário existe, mas pode não ter um registro de preferência ainda
    return defaults; // Agora isso é válido
  } catch (error) {
    console.error("Erro ao buscar preferências, usando padrões:", error);
    return defaults; // Agora isso é válido
  }
}
