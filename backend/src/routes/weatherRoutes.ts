import { Router } from "express";
import { deleteWeatherData } from "../controllers/weatherDataController";

const router = Router();

// --- Definição dos Schemas (Modelos de Resposta) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     # Schema genérico para uma resposta de deleção
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: "Mensagem de confirmação da deleção."
 *       example:
 *         message: "Weather data cache deleted"
 */
// --- Fim dos Schemas ---

/**
 * @swagger
 * /weather/{id}:
 *   delete:
 *     summary: Deleta um registro de cache de clima
 *     tags: [Weather (Cache)]
 *     description: |
 *       **Porquê:** Esta é uma rota administrativa ou de "limpeza".
 *
 *       Ela permite deletar um registro de cache `WeatherData` específico pelo seu ID. Esta não é uma rota de usuário comum, mas é útil para completar o CRUD e para possíveis manutenções.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: "O ID (UUID) do registro WeatherData (o cache) a ser deletado."
 *
 *     responses:
 *       200:
 *         description: "Cache de clima deletado com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       400:
 *         description: "Erro ao tentar deletar (ex: ID não encontrado)."
 *       404:
 *         description: "Registro de WeatherData não encontrado com o ID fornecido."
 */
router.delete("/:id", deleteWeatherData);

export default router;
