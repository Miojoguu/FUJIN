import { Request, Response } from "express";
import { PrismaClient, AlertOperator } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Valida os campos de entrada para criação de um alerta.
 * Retorna uma mensagem de erro se inválido, ou null se válido.
 */
const validateAlertInputs = (data: {
  locationId?: any;
  type?: any;
  threshold?: any;
  operator?: any;
}): string | null => {
  const { locationId, type, threshold, operator } = data;

  if (!locationId || typeof locationId !== "string") {
    return "locationId is required and must be a string.";
  }

  if (!type || typeof type !== "string" || type.trim() === "") {
    return "Alert type must be a non-empty string (e.g., 'temp', 'uv').";
  }

  if (threshold === undefined) {
    return "Threshold is required.";
  }

  if (isNaN(parseFloat(threshold))) {
    return "Threshold must be a valid number.";
  }

  if (!operator || !Object.values(AlertOperator).includes(operator)) {
    return `Invalid operator. Must be one of: ${Object.values(AlertOperator).join(
      ", "
    )}`;
  }

  return null; // Todos os inputs são válidos
};

/**
 * Criar um novo UserAlert.
 * Rota: POST /users/:userId/alerts
 */
export const createUserAlert = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { locationId, type, threshold, operator, timeOfDay } = req.body;

  // Validação
  const validationError = validateAlertInputs({
    locationId,
    type,
    threshold,
    operator,
  });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const alert = await prisma.userAlert.create({
      data: {
        userId,
        locationId,
        type,
        threshold: parseFloat(threshold), // Converte para Float
        operator,
        timeOfDay,
      },
    });
    res.status(201).json(alert);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Obter todos os alertas de um usuário específico.
 * Rota: GET /users/:userId/alerts
 */
export const getUserAlertsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const alerts = await prisma.userAlert.findMany({
      where: { userId },
      include: {
        location: {
          select: { name: true }, // Inclui o nome da localização
        },
      },
    });
    res.json(alerts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Obter todos os alertas de uma localização específica.
 * Rota: GET /locations/:locationId/alerts
 */
export const getUserAlertsByLocationId = async (
  req: Request,
  res: Response
) => {
  const { locationId } = req.params;

  try {
    const alerts = await prisma.userAlert.findMany({
      where: { locationId },
    });
    res.json(alerts);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Atualizar um UserAlert (ex: mudar o threshold).
 * Rota: PUT /alerts/:id
 */
export const updateUserAlert = async (req: Request, res: Response) => {
  const { id } = req.params; // ID do Alerta
  const { type, threshold, operator, timeOfDay } = req.body;

  // Prepara os dados para atualização (apenas o que foi enviado)
  const dataToUpdate: {
    type?: string;
    threshold?: number;
    operator?: AlertOperator;
    timeOfDay?: string | null;
  } = {};

  if (type !== undefined) {
    if (typeof type !== "string" || type.trim() === "") {
      return res
        .status(400)
        .json({ error: "Type must be a non-empty string" });
    }
    dataToUpdate.type = type;
  }

  if (threshold !== undefined) {
    const numThreshold = parseFloat(threshold);
    if (isNaN(numThreshold)) {
      return res.status(400).json({ error: "Threshold must be a number" });
    }
    dataToUpdate.threshold = numThreshold;
  }

  if (operator !== undefined) {
    if (!Object.values(AlertOperator).includes(operator)) {
      return res
        .status(400)
        .json({ error: "Invalid operator" });
    }
    dataToUpdate.operator = operator;
  }

  if (timeOfDay !== undefined) {
    dataToUpdate.timeOfDay = timeOfDay; // Permite definir como null
  }

  try {
    const alert = await prisma.userAlert.update({
      where: { id },
      data: dataToUpdate,
    });
    res.json(alert);
  } catch (err: any) {
    // Pega erro se o ID do alerta não for encontrado
    res.status(400).json({ error: err.message });
  }
};

/**
 * Deletar um UserAlert.
 * Rota: DELETE /alerts/:id
 */
export const deleteUserAlert = async (req: Request, res: Response) => {
  const { id } = req.params; // ID do Alerta

  try {
    await prisma.userAlert.delete({
      where: { id },
    });
    res.json({ message: "Alert deleted" });
  } catch (err: any) {
    // Pega erro se o ID do alerta não for encontrado
    res.status(400).json({ error: err.message });
  }
};