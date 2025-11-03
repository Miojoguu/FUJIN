import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { updateCacheForLocation } from "../services/weatherCacheService";
import { getPreferences } from "../services/preferenceService";

const prisma = new PrismaClient();

/**
 * [CREATE/UPDATE]
 * Rota: POST /locations/:locationId/refresh
 */
export const refreshWeatherData = async (req: Request, res: Response) => {
  const { locationId } = req.params;

  try {
    const createdData = await updateCacheForLocation(locationId);
    res.status(201).json(createdData);
  } catch (err: any) {
    console.error("Failed to refresh weather data:", err.message);
    if (err.message.includes("UserLocation não encontrada")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to refresh weather data" });
  }
};

/**
 * [READ] - (REFATORADO COM CORREÇÕES DE NULL)
 * Rota: GET /locations/:locationId/weather?userId=...
 */
export const getLatestWeatherData = async (req: Request, res: Response) => {
  const { locationId } = req.params;
  const { userId } = req.query as { userId: string | undefined };

  try {
    const prefs = await getPreferences(userId);

    const rawData = await prisma.weatherData.findFirst({
      where: { locationId },
      orderBy: { timestamp: "desc" },
      include: {
        airQuality: true,
        forecasts: {
          orderBy: { date: "asc" },
          include: { hourlyData: { orderBy: { time: "asc" } } },
        },
      },
    });

    if (!rawData) {
      return res.status(404).json({
        error: "No weather data found for this location. Try refreshing.",
      });
    }

    // [CORREÇÃO] Adicionado `?? 0` (nullish coalescing) para
    // fornecer 0 como fallback se o valor do banco for 'null'.
    const formattedResponse = {
      location: {
        locationId: rawData.locationId,
        timestamp: rawData.timestamp,
      },
      current: {
        temp:
          prefs.unitTemp === "C"
            ? rawData.temperature
            : ((rawData.temperature ?? 0) * 9) / 5 + 32, // Converte C -> F
        feelslike:
          prefs.unitTemp === "C"
            ? rawData.feelsLike
            : ((rawData.feelsLike ?? 0) * 9) / 5 + 32, // Converte C -> F
        wind:
          prefs.unitSpeed === "kph"
            ? rawData.windSpeed
            : (rawData.windSpeed ?? 0) / 1.609, // Converte KPH -> MPH
        humidity: rawData.humidity,
        windDirection: rawData.windDirection,
        rainProb: rawData.rainProb,
        uvIndex: rawData.uvIndex,
        pressure: rawData.pressure,
        dewPoint: rawData.dewPoint,
        tempUnit: prefs.unitTemp,
        speedUnit: prefs.unitSpeed,
      },
      airQuality: rawData.airQuality,
      forecasts: rawData.forecasts.map((day) => ({
        date: day.date,
        minTemp:
          prefs.unitTemp === "C"
            ? day.minTemp
            : ((day.minTemp ?? 0) * 9) / 5 + 32,
        maxTemp:
          prefs.unitTemp === "C"
            ? day.maxTemp
            : ((day.maxTemp ?? 0) * 9) / 5 + 32,
        rainProb: day.rainProb,
        humidity: day.humidity,
        uvIndex: day.uvIndex,
        sunrise: day.sunrise,
        sunset: day.sunset,
        moonPhase: day.moonPhase,
        hourlyData: day.hourlyData.map((hour) => ({
          time: hour.time,
          temp:
            prefs.unitTemp === "C"
              ? hour.temp
              : ((hour.temp ?? 0) * 9) / 5 + 32,
          windSpeed:
            prefs.unitSpeed === "kph"
              ? hour.windSpeed
              : (hour.windSpeed ?? 0) / 1.609,
          humidity: hour.humidity,
          rainProb: hour.rainProb,
          condition: hour.condition,
          iconUrl: hour.iconUrl,
        })),
      })),
    };

    res.json(formattedResponse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * [DELETE]
 * Rota: DELETE /weather/:id
 */
export const deleteWeatherData = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.weatherData.delete({
      where: { id },
    });
    res.json({ message: "Weather data cache deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
