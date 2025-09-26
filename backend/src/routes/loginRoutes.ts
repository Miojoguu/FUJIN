import { Router } from "express";

import { loginUser, loginWithX } from "../controllers/loginController";

const router = Router();

// Login Twitter
router.post("/twitter/callback", loginWithX, async (req, res) => {
  console.log("Recebido no backend:", req.body);
});

// Login Email + Senha
router.post("/login", loginUser);

export default router;
