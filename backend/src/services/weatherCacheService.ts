// src/services/weatherCacheService.ts
import { PrismaClient } from "@prisma/client";
import { getFullForecastDataByLatLong } from "../services/apiReciveCity";
import {
  ForecastApiResponse,
  ForecastDay,
} from "../interfaces/interface_apiReciveCity";

const prisma = new PrismaClient();

/**
 * Esta é a lógica central do "Job 1".
 * Busca dados frescos da API externa para UM local
 * e os salva no banco, substituindo o cache antigo.
 *
 * @param locationId O ID da UserLocation a ser atualizada.
 */
export const updateCacheForLocation = async (locationId: string) => {
  // 1. Encontrar a localização para saber a lat/long
  const location = await prisma.userLocation.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    throw new Error(`UserLocation não encontrada com ID: ${locationId}`);
  }

  // 2. Buscar dados frescos da API externa
  const apiResponse: ForecastApiResponse = await getFullForecastDataByLatLong(
    location.latitude.toString(),
    location.longitude.toString()
  );

  // 3. Limpar dados antigos ANTES de inserir os novos
  // Usamos uma transação para garantir que só deletamos se pudermos criar
  const deleteOld = prisma.weatherData.deleteMany({
    where: { locationId: locationId },
  });

  // 4. Mapear a resposta da API para o seu schema
  const currentData = apiResponse.current;
  const forecastDays = apiResponse.forecast.forecastday;

  const createNew = prisma.weatherData.create({
    data: {
      locationId: locationId,
      timestamp: new Date(currentData.last_updated_epoch * 1000),
      temperature: currentData.temp_c,
      feelsLike: currentData.feelslike_c,
      humidity: currentData.humidity,
      windSpeed: currentData.wind_kph,
      windDirection: currentData.wind_dir,
      rainProb: currentData.precip_mm,
      uvIndex: currentData.uv,
      pressure: currentData.pressure_mb,
      dewPoint: currentData.dewpoint_c,
      airQuality: {
        create: {
          co: currentData.air_quality?.co,
          no2: currentData.air_quality?.no2,
          o3: currentData.air_quality?.o3,
          so2: currentData.air_quality?.so2,
          pm2_5: currentData.air_quality?.pm2_5,
          pm10: currentData.air_quality?.pm10,
          usEpaIndex: currentData.air_quality
            ? currentData.air_quality["us-epa-index"]
            : undefined,
        },
      },
      forecasts: {
        create: forecastDays.map((day: ForecastDay) => ({
          date: new Date(day.date),
          minTemp: day.day.mintemp_c,
          maxTemp: day.day.maxtemp_c,
          rainProb: day.day.daily_chance_of_rain,
          humidity: day.day.avghumidity,
          uvIndex: day.day.uv,
          sunrise: day.astro.sunrise,
          sunset: day.astro.sunset,
          moonPhase: day.astro.moon_phase,
          hourlyData: {
            create: day.hour.map((hour) => ({
              time: new Date(hour.time_epoch * 1000),
              temp: hour.temp_c,
              windSpeed: hour.wind_kph,
              humidity: hour.humidity,
              rainProb: hour.chance_of_rain,
              condition: hour.condition.text,
              iconUrl: hour.condition.icon,
            })),
          },
        })),
      },
    },
    // Inclui os dados aninhados para retornar
    include: {
      airQuality: true,
      forecasts: { include: { hourlyData: true } },
    },
  });

  // 5. Executar a deleção e a criação em uma transação
  const [_, createdData] = await prisma.$transaction([deleteOld, createNew]);

  return createdData;
};
