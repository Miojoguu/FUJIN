import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  TwitterUserResponse,
  TwitterTokenResponse,
} from "../interfaces/interface_twitterAuthServices";
import axios from "axios";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "";
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!;
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL!;

// LOGIN EMAIL
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Usuário não encontrado" });

    if (!user.passwordHash)
      return res
        .status(401)
        .json({ error: "Usuário não tem senha cadastrada" });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
      return res.status(401).json({ error: "Senha incorreta" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login realizado com sucesso", token, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// LOGIN TWITTER
export const loginWithX = async (req: Request, res: Response) => {
  console.log("Chegou aqui");
  const { code, codeVerifier } = req.body;

  if (!code || !codeVerifier) {
    return res
      .status(400)
      .json({ error: "Code e codeVerifier são obrigatórios" });
  }

  try {
    const tokenResponse = await axios.post<TwitterTokenResponse>(
      "https://api.twitter.com/2/oauth2/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: TWITTER_CLIENT_ID,
        code,
        redirect_uri: TWITTER_CALLBACK_URL,
        code_verifier: codeVerifier,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const access_token = tokenResponse.data.access_token;
    if (!access_token) {
      return res
        .status(400)
        .json({ error: "Falha ao obter access_token do Twitter" });
    }

    const userResponse = await axios.get<TwitterUserResponse>(
      "https://api.twitter.com/2/users/me",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { id: providerId, name } = userResponse.data.data;

    let user = await prisma.user.findUnique({
      where: { provider_providerId: { provider: "twitter", providerId } },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          provider: "twitter",
          providerId,
          name,
          email: "",
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, provider: user.provider },
      JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({ message: "Login via X realizado com sucesso", token, user });
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
};
