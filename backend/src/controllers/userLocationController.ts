// src/controllers/userLocationController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Criar uma nova UserLocation.
 * Rota: POST /users/:userId/locations
 */
export const createUserLocation = async (req: Request, res: Response) => {
  const { userId } = req.params;
  // [MUDANÇA] Renomeado para indicar que vêm como string
  const { name, latitude: latString, longitude: longString } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ error: "userId (from URL parameter) is required" });
  }

  // Validação: 'name' (apelido) e coordenadas são obrigatórios
  if (!name || !latString || !longString) {
    return res
      .status(400)
      .json({ error: "name, latitude, and longitude are required" });
  }

  // [MUDANÇA] Converte para Float
  const latitude = parseFloat(latString);
  const longitude = parseFloat(longString);

  // [MUDANÇA] Adiciona validação de tipo numérico
  if (isNaN(latitude) || isNaN(longitude)) {
    return res
      .status(400)
      .json({ error: "latitude and longitude must be valid numbers" });
  }

  try {
    const location = await prisma.userLocation.create({
      data: {
        userId,
        name, // O apelido: "Casa", "Trabalho"
        latitude, // Passa o número
        longitude, // Passa o número
      },
    });
    res.status(201).json(location);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Obter todas as localizações salvas por um usuário.
 * Rota: GET /users/:userId/locations
 */
export const getUserLocationsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const locations = await prisma.userLocation.findMany({
      where: { userId },
    });
    // Isso retorna a lista de locais para a barra lateral
    res.json(locations);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/**
 * Atualizar uma localização (ex: renomear "Casa").
 * Rota: PUT /locations/:id
 */
export const updateUserLocation = async (req: Request, res: Response) => {
  const { id } = req.params; // Este é o 'id' interno do seu banco
  const { name } = req.body; // Permite apenas renomear o local

  if (!name) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  try {
    const location = await prisma.userLocation.update({
      where: { id },
      data: {
        name,
      },
    });
    res.json(location);
  } catch (err: any) {
    // Pega erro se o ID da localização não for encontrado
    res.status(400).json({ error: err.message });
  }
};

/**
 * Deletar uma localização salva.
 * Rota: DELETE /locations/:id
 */
export const deleteUserLocation = async (req: Request, res: Response) => {
  const { id } = req.params; // Este é o 'id' interno do seu banco

  try {
    await prisma.userLocation.delete({
      where: { id },
    });
    res.json({ message: "Location deleted" });
  } catch (err: any) {
    // Pega erro se o ID da localização não for encontrado
    res.status(400).json({ error: err.message });
  }
};
