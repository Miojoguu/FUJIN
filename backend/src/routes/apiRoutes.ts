import { Router } from "express";
import {
  reciveCity,
  CurentDataById,
  CurentDataByLatLong,
  forecastDataByLatLong,
  forecastDataById,
} from "../controllers/apiController";

const router = Router();

// --- Definição dos Schemas (Modelos de Resposta) ---
/**
 * @swagger
 * components:
 *   schemas:
 *     # Schema para a resposta do Autocomplete
 *     AutoCompleteLocation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: "O ID da localização (vindo da WeatherAPI)."
 *         name:
 *           type: string
 *           description: "O nome formatado (ex: 'Londres, Reino Unido')."
 *       example:
 *         id: "2801268"
 *         name: "London, United Kingdom"
 *
 *     # Schema para a Condição do Clima (reusado)
 *     WeatherCondition:
 *       type: object
 *       properties:
 *         text:
 *           type: string
 *         icon:
 *           type: string
 *           format: url
 *       example:
 *         text: "Ensolarado"
 *         icon: "//cdn.weatherapi.com/weather/64x64/day/113.png"
 *
 *     # Schema para a resposta do Clima Atual (Id)
 *     CurrentWeatherIdResponse:
 *       type: object
 *       properties:
 *         temp:
 *           type: number
 *         feelslike:
 *           type: number
 *         wind:
 *           type: number
 *         humidity:
 *           type: number
 *         condition:
 *           $ref: '#/components/schemas/WeatherCondition'
 *         speedUnit:
 *           type: string
 *           example: "kph"
 *         tempUnit:
 *           type: string
 *           example: "c"
 *
 *     # Schema para a resposta do Clima Atual (Lat/Long)
 *     CurrentWeatherLatLongResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/CurrentWeatherIdResponse'
 *         - type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "São José dos Campos"
 *             country:
 *               type: string
 *               example: "Brazil"
 *
 *     # Schema para a resposta da Previsão (7 dias)
 *     ForecastResponse:
 *       type: object
 *       properties:
 *         day_of_week:
 *           type: string
 *           example: "Seg"
 *         avgtemp:
 *           type: string
 *           example: "25.0"
 *         condition:
 *           $ref: '#/components/schemas/WeatherCondition'
 *         tempUnit:
 *           type: string
 *           example: "c"
 */
// --- Fim dos Schemas ---

/**
 * @swagger
 * /api/{city}:
 *   get:
 *     summary: Busca de Cidades (Autocomplete)
 *     tags: [API Externa (Busca)]
 *     description: |
 *       **Porquê:** Esta rota é usada pela barra de busca do aplicativo.
 *
 *       O usuário digita um nome parcial (ex: "Lond") e esta rota retorna uma lista de locais correspondentes (ex: "Londres, Reino Unido", "London, CA").
 *
 *       É uma rota de "olhada rápida" e não interage com o banco de dados.
 *
 *     parameters:
 *       - in: path
 *         name: city
 *         required: true
 *         schema:
 *           type: string
 *         description: "O nome parcial da cidade (ex: 'sao jo')."
 *
 *     responses:
 *       200:
 *         description: "Um array de locais encontrados (limitado a 8)."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AutoCompleteLocation'
 *       500:
 *         description: "Erro interno do servidor."
 */
router.get("/:city", reciveCity);

/**
 * @swagger
 * /api/weather/latlong:
 *   get:
 *     summary: Obtém clima atual por Latitude/Longitude
 *     tags: [API Externa (Clima Atual)]
 *     description: |
 *       **Porquê:** Esta é a rota principal para a tela inicial (Modo 1: Local Atual).
 *
 *       Ela pega as coordenadas do GPS do celular e retorna o clima atual para aquele ponto exato.
 *
 *       Ela usa o `userId` (opcional) para formatar a resposta (C° ou F°) de acordo com as preferências do usuário.
 *
 *       Não salva nada no banco de dados.
 *
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         description: "Latitude (ex: '-23.1791')"
 *       - in: query
 *         name: long
 *         required: true
 *         schema:
 *           type: string
 *         description: "Longitude (ex: '-45.8872')"
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: "ID do usuário logado (para buscar preferências C°/F°)."
 *
 *     responses:
 *       200:
 *         description: "Os dados do clima atual formatados."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentWeatherLatLongResponse'
 *       500:
 *         description: "Erro interno do servidor."
 */
router.get("/weather/latlong", CurentDataByLatLong);

/**
 * @swagger
 * /api/weather/data:
 *   get:
 *     summary: Obtém clima atual por ID (WeatherAPI)
 *     tags: [API Externa (Clima Atual)]
 *     description: |
 *       **Porquê:** Esta rota é usada após o usuário selecionar um local da busca (autocomplete).
 *
 *       A rota `/api/{city}` (autocomplete) retorna um ID. Esse ID é usado aqui para buscar os dados de clima atuais daquele local específico.
 *
 *       Não salva nada no banco de dados.
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID da localização (vindo da rota de autocomplete)."
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: "ID do usuário logado (para buscar preferências C°/F°)."
 *
 *     responses:
 *       200:
 *         description: "Os dados do clima atual formatados."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CurrentWeatherIdResponse'
 *       500:
 *         description: "Erro interno do servidor."
 */
router.get("/weather/data", CurentDataById);

/**
 * @swagger
 * /api/forecast/latlong:
 *   get:
 *     summary: Obtém previsão (7 dias) por Latitude/Longitude
 *     tags: [API Externa (Previsão)]
 *     description: |
 *       **Porquê:** Esta rota complementa a `/api/weather/latlong`.
 *
 *       Ela busca a previsão simplificada (próximos 7 dias) para a tela inicial (Modo 1: Local Atual por GPS).
 *
 *       Não salva nada no banco de dados.
 *
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: string
 *         description: "Latitude (ex: '-23.1791')"
 *       - in: query
 *         name: long
 *         required: true
 *         schema:
 *           type: string
 *         description: "Longitude (ex: '-45.8872')"
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: "ID do usuário logado (para buscar preferências C°/F°)."
 *
 *     responses:
 *       200:
 *         description: "Um array com a previsão simplificada para os próximos 7 dias."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ForecastResponse'
 *       500:
 *         description: "Erro interno do servidor."
 */
router.get("/forecast/latlong", forecastDataByLatLong);

/**
 * @swagger
 * /api/forecast/data:
 *   get:
 *     summary: Obtém previsão (7 dias) por ID (WeatherAPI)
 *     tags: [API Externa (Previsão)]
 *     description: |
 *       **Porquê:** Esta rota complementa a `/api/weather/data`.
 *
 *       Ela busca a previsão simplificada (próximos 7 dias) após o usuário selecionar um local da lista de autocomplete.
 *
 *       Não salva nada no banco de dados.
 *
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: "O ID da localização (vindo da rota de autocomplete)."
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: string
 *         description: "ID do usuário logado (para buscar preferências C°/F°)."
 *
 *     responses:
 *       200:
 *         description: "Um array com a previsão simplificada para os próximos 7 dias."
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ForecastResponse'
 *       500:
 *         description: "Erro interno do servidor."
 */
router.get("/forecast/data", forecastDataById);

export default router;
