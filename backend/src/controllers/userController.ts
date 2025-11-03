// src/controllers/userController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Criar usuário
export const createUser = async (req: Request, res: Response) => {
  const { email, name, password, provider, providerId } = req.body;

  try {
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.create({
      data: { email, name, passwordHash, provider, providerId },
    });

    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Ler todos os usuários
export const getUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

// Ler usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { email, name, password } = req.body;

  try {
    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const user = await prisma.user.update({
      where: { id },
      data: { email, name, passwordHash },
    });

    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateUserPushToken = async (req: Request, res: Response) => {
  const { id: userId } = req.params;
  const { pushToken } = req.body;

  if (!pushToken || typeof pushToken !== "string") {
    return res.status(400).json({ error: "pushToken (string) is required" });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pushToken: pushToken, // Salva o novo token no banco
      },
    });

    res.json({
      message: "Push token updated successfully",
      userId: updatedUser.id,
    });
  } catch (err: any) {
    // Pega erro se o ID do usuário não for encontrado
    // ou se o pushToken já estiver em uso (Unique constraint)
    console.error("Erro ao salvar push token:", err.message);
    res.status(400).json({ error: err.message });
  }
};
