import { Router } from "express";
import {
  updateUserAlert,
  deleteUserAlert,
} from "../controllers/userAlertController";

const router = Router();

// --- Definição dos Schemas (Modelos de Resposta e Corpo) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     # Enum para os Operadores de Alerta
 *     AlertOperator:
 *       type: string
 *       enum: [GT, LT, GTE, LTE, EQ]
 *       description: |
 *         Operador de comparação:
 *         * `GT`: Maior que (>)
 *         * `LT`: Menor que (<)
 *         * `GTE`: Maior ou igual (>=)
 *         * `LTE`: Menor ou igual (<=)
 *         * `EQ`: Igual (=)
 *
 *     # Schema do Alerta de Usuário (Resposta)
 *     UserAlert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: "O ID do alerta."
 *         userId:
 *           type: string
 *           format: uuid
 *           description: "O ID do usuário dono do alerta."
 *         locationId:
 *           type: string
 *           format: uuid
 *           description: "O ID da localização salva à qual o alerta pertence."
 *         type:
 *           type: string
 *           description: "O tipo de dado meteorológico a ser monitorado (ex: 'temp', 'uv', 'rainProb')."
 *         threshold:
 *           type: number
 *           format: float
 *           description: "O valor numérico do gatilho (ex: 30 para 30°C)."
 *         operator:
 *           $ref: '#/components/schemas/AlertOperator'
 *         timeOfDay:
 *           type: string
 *           nullable: true
 *           description: "Horário específico para o alerta (ex: '08:00') ou null."
 *
 *     # Schema para Atualizar um Alerta (Corpo da Requisição)
 *     UpdateUserAlert:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: "O tipo de dado meteorológico (ex: 'temp')."
 *         threshold:
 *           type: number
 *           format: float
 *           description: "O valor numérico do gatilho."
 *         operator:
 *           $ref: '#/components/schemas/AlertOperator'
 *         timeOfDay:
 *           type: string
 *           nullable: true
 *           description: "Horário específico (ou null para remover)."
 *       example:
 *         type: "temp"
 *         threshold: 35
 *         operator: "GTE"
 */
// --- Fim dos Schemas ---

/**
 * @swagger
 * /alerts/{id}:
 *   put:
 *     summary: Atualiza um alerta existente
 *     tags: [Alerts]
 *     description: |
 *       **Porquê:** Esta rota permite ao usuário modificar um alerta que ele já criou.
 *
 *       Ele pode mudar qualquer um dos campos (o tipo, o valor, o operador) enviando apenas os campos que deseja alterar.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "O ID (UUID) do alerta a ser atualizado."
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserAlert'
 *
 *     responses:
 *       200:
 *         description: "O alerta foi atualizado com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAlert'
 *       400:
 *         description: "Dados inválidos (ex: 'operator' não existe, 'threshold' não é um número)."
 *       404:
 *         description: "Alerta não encontrado com o ID fornecido."
 */
router.put("/:id", updateUserAlert);

/**
 * @swagger
 * /alerts/{id}:
 *   delete:
 *     summary: Deleta um alerta existente
 *     tags: [Alerts]
 *     description: |
 *       **Porquê:** Esta rota permite ao usuário remover um alerta que ele não deseja mais.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "O ID (UUID) do alerta a ser deletado."
 *
 *     responses:
 *       200:
 *         description: "O alerta foi deletado com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Alert deleted"
 *       400:
 *         description: "Erro ao tentar deletar (ex: ID não encontrado)."
 *       404:
 *         description: "Alerta não encontrado com o ID fornecido."
 */
router.delete("/:id", deleteUserAlert);

export default router;
