// src/controllers/userPreferenceController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Valida os campos de preferência.
 * Retorna uma mensagem de erro se inválido, ou null se válido.
 */
const validatePreferenceInputs = (data: {
  unitTemp?: any;
  unitSpeed?: any;
  hourFormat?: any;
}): string | null => {
  const { unitTemp, unitSpeed, hourFormat } = data;

  // Valida unitTemp. Se for fornecido, deve ser "C" ou "F"
  if (unitTemp && !["C", "F"].includes(unitTemp)) {
    return 'Invalid unitTemp. Must be "C" or "F".';
  }

  // Valida unitSpeed. Se for fornecido, deve ser "mph" ou "kph"
  if (unitSpeed && !["mph", "kph"].includes(unitSpeed)) {
    return 'Invalid unitSpeed. Must be "mph" or "kph".';
  }

  // Valida hourFormat. Se for fornecido, deve ser "12h" ou "24h"
  if (hourFormat && !["h12", "h24"].includes(hourFormat)) {
    return 'Invalid hourFormat. Must be "12h" or "24h".';
  }

  return null; // Todos os inputs são válidos
};

// --- CRUD POR ID DO USUÁRIO (Método recomendado para rotas aninhadas) ---

// Criar UserPreference (para rotas aninhadas: POST /users/:id/preferences)
export const createUserPreference = async (req: Request, res: Response) => {
  // Pega o ID do usuário pelo parâmetro da rota
  const { userId } = req.params;
  const { unitTemp, unitSpeed, hourFormat, simplifiedMode } = req.body;

  // Validação
  const validationError = validatePreferenceInputs({
    unitTemp,
    unitSpeed,
    hourFormat,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId (from URL parameter) is required" });
  }

  try {
    const preference = await prisma.userPreference.create({
      data: {
        userId,
        unitTemp,
        unitSpeed,
        hourFormat,
        simplifiedMode,
      },
    });

    res.json(preference);
  } catch (err: any) {
    // Pega erro se o usuário já tiver preferências (P2002: Unique constraint failed )
    res.status(400).json({ error: err.message });
  }
};

// Ler UserPreference pelo UserID (para rotas aninhadas: GET /users/:id/preferences)
export const getUserPreferenceByUserId = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params; // ID do Usuário
  const preference = await prisma.userPreference.findUnique({
    where: { userId },
  });
  if (!preference) {
    return res.status(404).json({ error: "Preferências não encontradas" });
  }
  res.json(preference);
};

// Atualizar UserPreference pelo UserID (para rotas aninhadas: PUT /users/:id/preferences)
export const updateUserPreferenceByUserId = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params; // ID do Usuário
  const { unitTemp, unitSpeed, hourFormat, simplifiedMode } = req.body;

  // Validação
  const validationError = validatePreferenceInputs({
    unitTemp,
    unitSpeed,
    hourFormat,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const preference = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        // O que fazer se JÁ EXISTIR
        unitTemp,
        unitSpeed,
        hourFormat,
      },
      create: {
        // O que fazer se NÃO EXISTIR
        userId,
        unitTemp,
        unitSpeed,
        hourFormat,
      },
    });

    res.json(preference);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// --- CRUD POR ID DA PREFERÊNCIA (Método padrão) ---

// Ler todas as UserPreferences (GET /preferences)
export const getUserPreferences = async (_: Request, res: Response) => {
  const preferences = await prisma.userPreference.findMany();
  res.json(preferences);
};

// Ler UserPreference pelo ID da Preferência (GET /preferences/:id)
export const getUserPreferenceById = async (req: Request, res: Response) => {
  const { id } = req.params; // ID da Preferência
  const preference = await prisma.userPreference.findUnique({ where: { id } });
  if (!preference) {
    return res.status(404).json({ error: "Preference not found" });
  }
  res.json(preference);
};

// Atualizar UserPreference pelo ID da Preferência (PUT /preferences/:id)
export const updateUserPreference = async (req: Request, res: Response) => {
  const { id } = req.params; // ID da Preferência
  const { unitTemp, unitSpeed, hourFormat, simplifiedMode } = req.body;

  // Validação
  const validationError = validatePreferenceInputs({
    unitTemp,
    unitSpeed,
    hourFormat,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const preference = await prisma.userPreference.update({
      where: { id },
      data: { unitTemp, unitSpeed, hourFormat, simplifiedMode },
    });

    res.json(preference);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar UserPreference pelo ID da Preferência (DELETE /preferences/:id)
export const deleteUserPreference = async (req: Request, res: Response) => {
  const { id } = req.params; // ID da Preferência

  try {
    await prisma.userPreference.delete({ where: { id } });
    res.json({ message: "Preference deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
