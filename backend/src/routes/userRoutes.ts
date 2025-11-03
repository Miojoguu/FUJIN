import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPushToken,
} from "../controllers/userController";

import {
  createUserPreference,
  getUserPreferenceByUserId,
  updateUserPreferenceByUserId,
} from "../controllers/userPreferenceController";

import {
  createUserLocation,
  getUserLocationsByUserId,
} from "../controllers/userLocationController";

import {
  createUserAlert,
  getUserAlertsByUserId,
} from "../controllers/userAlertController";

const router = Router();

// --- Definição dos Schemas (Modelos de Resposta e Corpo) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     # === SCHEMAS DE USUÁRIO ===
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *
 *     NewUser:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *       example:
 *         email: "usuario@email.com"
 *         name: "Nome do Usuário"
 *         password: "senha123"
 *
 *     UpdateUser:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         name:
 *           type: string
 *         password:
 *           type: string
 *           format: password
 *           description: "A senha antiga (se for trocar a senha)."
 *         newPassword:
 *           type: string
 *           format: password
 *           description: "A nova senha (opcional)."
 *
 *     # === SCHEMAS DE PREFERÊNCIA ===
 *     HourFormat:
 *       type: string
 *       enum:
 *         - h12
 *         - h24
 *       description: "Formato de hora (12h ou 24h)."
 *
 *     TemperatureUnit:
 *       type: string
 *       enum:
 *         - C
 *         - F
 *       description: "Unidade de temperatura (Celsius ou Fahrenheit)."
 *
 *     SpeedUnit:
 *       type: string
 *       enum:
 *         - kph
 *         - mph
 *       description: "Unidade de velocidade (km/h ou mph)."
 *
 *     UserPreference:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         unitTemp:
 *           $ref: '#/components/schemas/TemperatureUnit'
 *         unitSpeed:
 *           $ref: '#/components/schemas/SpeedUnit'
 *         hourFormat:
 *           $ref: '#/components/schemas/HourFormat'
 *         simplifiedMode:
 *           type: boolean
 *       example:
 *         id: "pref_a1b2..."
 *         userId: "user_c3d4..."
 *         unitTemp: "C"
 *         unitSpeed: "kph"
 *         hourFormat: "h24"
 *         simplifiedMode: false
 *
 *     NewOrUpdateUserPreference:
 *       type: object
 *       properties:
 *         unitTemp:
 *           $ref: '#/components/schemas/TemperatureUnit'
 *         unitSpeed:
 *           $ref: '#/components/schemas/SpeedUnit'
 *         hourFormat:
 *           $ref: '#/components/schemas/HourFormat'
 *         simplifiedMode:
 *           type: boolean
 *       example:
 *         unitTemp: "F"
 *         unitSpeed: "mph"
 *
 *     # === SCHEMAS DE LOCALIZAÇÃO ===
 *     UserLocation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *
 *     NewUserLocation:
 *       type: object
 *       required:
 *         - name
 *         - latitude
 *         - longitude
 *       properties:
 *         name:
 *           type: string
 *           description: "Apelido do local (ex: Casa)"
 *         latitude:
 *           type: string
 *           description: "Latitude (ex: -23.1791). O controller converte para Float."
 *         longitude:
 *           type: string
 *           description: "Longitude (ex: -45.8872). O controller converte para Float."
 *       example:
 *         name: "Trabalho"
 *         latitude: "-23.1900"
 *         longitude: "-45.8700"
 *
 *     # === SCHEMAS DE ALERTA ===
 *     AlertOperator:
 *       type: string
 *       enum:
 *         - GT
 *         - LT
 *         - GTE
 *         - LTE
 *         - EQ
 *
 *     UserAlert:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         locationId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *         threshold:
 *           type: number
 *           format: float
 *         operator:
 *           $ref: '#/components/schemas/AlertOperator'
 *         timeOfDay:
 *           type: string
 *           nullable: true
 *
 *     NewUserAlert:
 *       type: object
 *       required:
 *         - locationId
 *         - type
 *         - threshold
 *         - operator
 *       properties:
 *         locationId:
 *           type: string
 *           format: uuid
 *           description: "O ID da localização salva à qual o alerta pertence."
 *         type:
 *           type: string
 *           description: "Tipo de dado (ex: 'temp', 'uv', 'rainProb')."
 *         threshold:
 *           type: number
 *           format: float
 *           description: "Valor gatilho (ex: 30)."
 *         operator:
 *           $ref: '#/components/schemas/AlertOperator'
 *         timeOfDay:
 *           type: string
 *           nullable: true
 *           description: "Horário (ex: '08:00') ou null."
 *       example:
 *         locationId: "loc_a1b2..."
 *         type: "uv"
 *         threshold: 8
 *         operator: "GTE"
 */
// --- Fim dos Schemas ---

// --- CRUD Usuarios ---

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Cria um novo usuário (Cadastro)
 *     tags: [Users]
 *     description: |
 *       **O Porquê:** Esta é a rota de cadastro principal.
 *
 *       Recebe e-mail, senha e nome, e cria um novo registro de usuário no banco.
 *
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com os dados do novo usuário.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *
 *     responses:
 *       201:
 *         description: A Resposta. Usuário criado com sucesso. Retorna o objeto do usuário sem a senha.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: E-mail já existe ou dados inválidos.
 */
router.post("/", createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista todos os usuários (Rota de Admin)
 *     tags: [Users]
 *     description: |
 *       **O Porquê:** Uma rota de diagnóstico ou administrativa para listar todos os usuários cadastrados.
 *
 *       (Deve ser protegida por autenticação de Admin no futuro).
 *
 *     responses:
 *       200:
 *         description: A Resposta. Um array de todos os usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/", getUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Users]
 *     description: |
 *       **O Porquê:** Permite buscar os dados de um perfil de usuário específico.
 *
 *       (Deve ser protegida, permitindo que apenas o próprio usuário ou um admin acesse).
 *
 *     parameters:
 *       - name: id
 *         in: path
 *         description: O Pedido. O ID (UUID) do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: A Resposta. Os dados do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Usuário não encontrado.
 */
router.get("/:id", getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Atualiza um usuário
 *     tags: [Users]
 *     description: |
 *       **O Porquê:** Permite ao usuário atualizar seus dados de perfil (nome, e-mail, senha).
 *
 *       (Deve ser protegida).
 *
 *     parameters:
 *       - name: id
 *         in: path
 *         description: O ID (UUID) do usuário a ser atualizado.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com os campos a serem atualizados.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *
 *     responses:
 *       200:
 *         description: A Resposta. Usuário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Dados inválidos ou senha antiga incorreta.
 *       404:
 *         description: Usuário não encontrado.
 */
router.put("/:id", updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Deleta um usuário
 *     tags: [Users]
 *     description: |
 *       **O Porquê:** Permite que um usuário delete sua própria conta.
 *
 *       (Deve ser protegida).
 *
 *     parameters:
 *       - name: id
 *         in: path
 *         description: O Pedido. O ID (UUID) do usuário a ser deletado.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: A Resposta. Usuário deletado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User deleted"
 *       404:
 *         description: Usuário não encontrado.
 */
router.delete("/:id", deleteUser);

/**
 * @swagger
 * /users/{id}/push-token:
 *   put:
 *     summary: Salva o Push Token do usuário
 *     tags: [Users (Push Notifications)]
 *     description: |
 *       **O Porquê:** Esta é a rota que o aplicativo móvel chama (Tópico 2) para registrar o "endereço" do dispositivo do usuário para notificações push.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         description: O Pedido. O ID (UUID) do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com o token.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePushToken'
 *
 *     responses:
 *       "200":
 *         description: A Resposta. Token salvo com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Push token updated successfully"
 *                 userId:
 *                   type: string
 *                   format: uuid
 *
 *       "400":
 *         description: "'pushToken' não fornecido ou ID do usuário não encontrado."
 */
router.put("/:id/push-token", updateUserPushToken);

// --- CRUD Preferencia ---

/**
 * @swagger
 * /users/{userId}/preferences:
 *   post:
 *     summary: Cria as preferências para um usuário
 *     tags: [Preferences]
 *     description: |
 *       **O Porquê:** Esta rota é chamada (apenas uma vez, idealmente após o cadastro) para criar o registro de preferências de um usuário.
 *
 *       Se o usuário já tiver preferências, esta rota falhará. Para modificar, use a rota `PUT`.
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com as preferências iniciais.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOrUpdateUserPreference'
 *
 *     responses:
 *       201:
 *         description: A Resposta. Preferências criadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreference'
 *       400:
 *         description: Dados inválidos ou usuário já possui preferências.
 */
router.post("/:userId/preferences", createUserPreference);

/**
 * @swagger
 * /users/{userId}/preferences:
 *   get:
 *     summary: Busca as preferências de um usuário
 *     tags: [Preferences]
 *     description: |
 *       **O Porquê:** Rota essencial. O frontend chama esta rota ao iniciar o app para saber se deve exibir 'C' ou 'F', 'kph' ou 'mph', 'h12' ou 'h24'.
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O Pedido. O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: A Resposta. O objeto de preferências do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreference'
 *       404:
 *         description: Usuário não possui um registro de preferências.
 */
router.get("/:userId/preferences", getUserPreferenceByUserId);

/**
 * @swagger
 * /users/{userId}/preferences:
 *   put:
 *     summary: Atualiza as preferências de um usuário
 *     tags: [Preferences]
 *     description: |
 *       **O Porquê:** Esta é a rota usada na tela de "Configurações".
 *
 *       Permite ao usuário modificar suas preferências (ex: mudar de 'C' para 'F').
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com as preferências a serem atualizadas.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewOrUpdateUserPreference'
 *
 *     responses:
 *       200:
 *         description: A Resposta. Preferências atualizadas com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreference'
 *       400:
 *         description: |
 *           Dados inválidos (ex: 'unitTemp' enviado como 'Z').
 *       404:
 *         description: Registro de preferências não encontrado.
 */
router.put("/:userId/preferences", updateUserPreferenceByUserId);

// --- CRUD Localizacao ---

/**
 * @swagger
 * /users/{userId}/locations:
 *   post:
 *     summary: Salva uma nova localização para um usuário
 *     tags: [Locations]
 *     description: |
 *       **O Porquê:** Esta é a rota chamada quando o usuário clica no "+" na sidebar e salva um novo local (ex: "Casa", "Trabalho"), como na 'image_f49b25.png'.
 *
 *       Recebe o apelido (nome) e as coordenadas.
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto com o nome e as coordenadas do novo local.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUserLocation'
 *
 *     responses:
 *       201:
 *         description: A Resposta. Localização salva com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLocation'
 *       400:
 *         description: |
 *           Dados inválidos (ex: 'name' faltando ou 'latitude' inválida).
 */
router.post("/:userId/locations", createUserLocation);

/**
 * @swagger
 * /users/{userId}/locations:
 *   get:
 *     summary: Lista todas as localizações salvas de um usuário
 *     tags: [Locations]
 *     description: |
 *       **O Porquê:** Esta rota preenche a "Lateral Bar" (sidebar, como na 'image_f497a1.png') com a lista de locais salvos (ex: "Casa", "Trabalho").
 *
 *       Retorna apenas a lista, não o clima.
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O Pedido. O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: A Resposta. Um array das localizações salvas pelo usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserLocation'
 */
router.get("/:userId/locations", getUserLocationsByUserId);

// --- CRUD Alertas ---

/**
 * @swagger
 * /users/{userId}/alerts:
 *   post:
 *     summary: Cria um novo alerta para um usuário
 *     tags: [Alerts]
 *     description: |
 *       **O Porquê:** Esta rota permite ao usuário definir um novo gatilho de alerta (ex: "Me avise se a temperatura na 'Casa' for > 30°C").
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     requestBody:
 *       description: O Pedido. Um objeto com as regras do novo alerta.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewUserAlert'
 *
 *     responses:
 *       201:
 *         description: A Resposta. Alerta criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAlert'
 *       400:
 *         description: |
 *           Dados inválidos (ex: 'operator' não existe ou 'locationId' não pertence ao usuário).
 */
router.post("/:userId/alerts", createUserAlert);

/**
 * @swagger
 * /users/{userId}/alerts:
 *   get:
 *     summary: Lista todos os alertas de um usuário
 *     tags: [Alerts]
 *     description: |
 *       **O Porquê:** Permite ao frontend exibir a lista de "Meus Alertas" na tela de configurações.
 *
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: O Pedido. O ID do usuário.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *
 *     responses:
 *       200:
 *         description: A Resposta. Um array dos alertas criados pelo usuário.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAlert'
 */
router.get("/:userId/alerts", getUserAlertsByUserId);

export default router;
