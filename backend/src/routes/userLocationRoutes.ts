import { Router } from "express";
import {
  updateUserLocation,
  deleteUserLocation,
} from "../controllers/userLocationController";

import {
  refreshWeatherData,
  getLatestWeatherData,
} from "../controllers/weatherDataController";

const router = Router();

// --- Definição dos Schemas (Modelos de Resposta e Corpo) ---
/**
 * @swagger
 * components:
 *   schemas:
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
 *           description: "Apelido do local (ex: Casa, Trabalho)"
 *         latitude:
 *           type: number
 *           format: float
 *         longitude:
 *           type: number
 *           format: float
 *       example:
 *         id: "a1b2c3d4-..."
 *         userId: "e5f6a7b8-..."
 *         name: "Minha Casa"
 *         latitude: -23.1791
 *         longitude: -45.8872
 *
 *     UpdateUserLocation:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: "O novo nome para o local salvo."
 *       example:
 *         name: "Casa (Home Office)"
 *
 *     AirQuality:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         co:
 *           type: number
 *           format: float
 *         no2:
 *           type: number
 *           format: float
 *         o3:
 *           type: number
 *           format: float
 *         so2:
 *           type: number
 *           format: float
 *         pm2_5:
 *           type: number
 *           format: float
 *         pm10:
 *           type: number
 *           format: float
 *         usEpaIndex:
 *           type: integer
 *
 *     HourlyForecast:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         time:
 *           type: string
 *           format: date-time
 *         temp:
 *           type: number
 *           format: float
 *         windSpeed:
 *           type: number
 *           format: float
 *         humidity:
 *           type: integer
 *         rainProb:
 *           type: integer
 *         condition:
 *           type: string
 *         iconUrl:
 *           type: string
 *
 *     Forecast:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date-time
 *         minTemp:
 *           type: number
 *           format: float
 *         maxTemp:
 *           type: number
 *           format: float
 *         rainProb:
 *           type: number
 *           format: float
 *         humidity:
 *           type: integer
 *         uvIndex:
 *           type: number
 *           format: float
 *         sunrise:
 *           type: string
 *         sunset:
 *           type: string
 *         moonPhase:
 *           type: string
 *         hourlyData:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/HourlyForecast'
 *
 *     FullWeatherData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         locationId:
 *           type: string
 *           format: uuid
 *         timestamp:
 *           type: string
 *           format: date-time
 *         temperature:
 *           type: number
 *           format: float
 *         feelsLike:
 *           type: number
 *           format: float
 *         humidity:
 *           type: integer
 *         windSpeed:
 *           type: number
 *           format: float
 *         windDirection:
 *           type: string
 *         rainProb:
 *           type: number
 *           format: float
 *         uvIndex:
 *           type: number
 *           format: float
 *         pressure:
 *           type: number
 *           format: float
 *         dewPoint:
 *           type: number
 *           format: float
 *         airQuality:
 *           $ref: '#/components/schemas/AirQuality'
 *         forecasts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Forecast'
 *
 *     FormattedWeatherData:
 *       type: object
 *       properties:
 *         location:
 *           type: object
 *           properties:
 *             locationId:
 *               type: string
 *               format: uuid
 *             timestamp:
 *               type: string
 *               format: date-time
 *         current:
 *           type: object
 *           properties:
 *             temp:
 *               type: number
 *               format: float
 *             feelslike:
 *               type: number
 *               format: float
 *             wind:
 *               type: number
 *               format: float
 *             humidity:
 *               type: integer
 *             windDirection:
 *               type: string
 *             rainProb:
 *               type: number
 *               format: float
 *             uvIndex:
 *               type: number
 *               format: float
 *             pressure:
 *               type: number
 *               format: float
 *             dewPoint:
 *               type: number
 *               format: float
 *             tempUnit:
 *               $ref: '#/components/schemas/TemperatureUnit'
 *             speedUnit:
 *               $ref: '#/components/schemas/SpeedUnit'
 *             airQuality:
 *               $ref: '#/components/schemas/AirQuality'
 *         forecasts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               minTemp:
 *                 type: number
 *                 format: float
 *               maxTemp:
 *                 type: number
 *                 format: float
 *               rainProb:
 *                 type: number
 *                 format: float
 *               humidity:
 *                 type: integer
 *               uvIndex:
 *                 type: number
 *                 format: float
 *               sunrise:
 *                 type: string
 *               sunset:
 *                 type: string
 *               moonPhase:
 *                 type: string
 *               hourlyData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time:
 *                       type: string
 *                       format: date-time
 *                     temp:
 *                       type: number
 *                       format: float
 *                     windSpeed:
 *                       type: number
 *                       format: float
 *                     humidity:
 *                       type: integer
 *                     rainProb:
 *                       type: integer
 *                     condition:
 *                       type: string
 *                     iconUrl:
 *                       type: string
 */

// --- Fim dos Schemas ---

/**
 * @swagger
 * /locations/{id}:
 *   put:
 *     summary: Atualiza o nome de uma localização salva
 *     tags: [Locations (Cache)]
 *     description: |
 *       **O Porquê:** Esta rota permite ao usuário renomear um local salvo (ex: 'Casa' para 'Minha Casa').
 *
 *       Ela **não** mexe nas coordenadas e nem atualiza o cache de clima.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: O Pedido. O ID (UUID) da localização a ser atualizada.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       description: O Pedido. Um objeto JSON com o novo nome.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserLocation'
 *     responses:
 *       "200":
 *         description: A Resposta. Localização atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLocation'
 *       "400":
 *         description: Nome ('name') não fornecido ou ID não encontrado.
 */
router.put("/:id", updateUserLocation);

/**
 * @swagger
 * /locations/{id}:
 *   delete:
 *     summary: Deleta uma localização salva
 *     tags: [Locations (Cache)]
 *     description: |
 *       **O Porquê:** Esta rota remove um local salvo da lista do usuário.
 *
 *       **Atenção:** Com o `onDelete: Cascade` no schema, esta rota deletará automaticamente todos os `WeatherData`, `Forecasts` e `Alerts` associados.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: "O Pedido. O ID (UUID) da localização a ser deletada."
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: "A Resposta. Localização deletada com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Location deleted"
 *       "400":
 *         description: "Erro ao tentar deletar (ex: ID não encontrado)."
 */
router.delete("/:id", deleteUserLocation);

/**
 * @swagger
 * /locations/{locationId}/refresh:
 *   post:
 *     summary: Atualiza (refresca) o cache de clima de um local
 *     tags: [Locations (Cache)]
 *     description: |
 *       **O Porquê:** Esta é a rota que o frontend chama para forçar uma atualização (ex: pull-to-refresh).
 *
 *       Ela chama o serviço de cache (`weatherCacheService`) para buscar dados da API externa e salvar no *nosso* banco.
 *
 *       A resposta desta rota são os dados **brutos** (padrão C°/kph) recém salvos.
 *     parameters:
 *       - in: path
 *         name: locationId
 *         description: O Pedido. O ID da localização a ser atualizada.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "201":
 *         description: Cache de clima criado/atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FullWeatherData'
 *       "404":
 *         description: Localização (`locationId`) não encontrada.
 *       "500":
 *         description: Falha ao buscar dados da API externa ou ao salvar no banco.
 */
router.post("/:locationId/refresh", refreshWeatherData);

/**
 * @swagger
 * /locations/{locationId}/weather:
 *   get:
 *     summary: Obtém os dados de clima de um local (formatado)
 *     tags: [Locations (Cache)]
 *     description: |
 *       **O Porquê:** Esta é a rota principal para carregar a tela de um local *salvo* (como "Casa").
 *
 *       Busca os dados do cache do nosso banco instantaneamente.
 *
 *       Se fornecido, `userId` converte unidades (C°/F°, kph/mph) antes de enviar ao frontend.
 *     parameters:
 *       - in: path
 *         name: locationId
 *         description: ID da localização salva.
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: userId
 *         description: ID do usuário logado (opcional).
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       "200":
 *         description: Objeto de clima formatado com as unidades corretas.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FormattedWeatherData'
 *       "404":
 *         description: Nenhum cache de clima encontrado.
 */
router.get("/:locationId/weather", getLatestWeatherData);

export default router;
