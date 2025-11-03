import { Request, Response } from "express";
import {
  autoComplete,
  meteorologicalCurentDataById,
  meteorologicalCurentDataByLatLong,
  meteorologicalForecastDataById,
  meteorologicalForecastDataByLatLong,
} from "../services/apiReciveCity";
import {
  ForecastDay,
  LocationSearchResult,
  WeatherData,
} from "../interfaces/interface_apiReciveCity";

// [MUDANÇA] Importe o novo serviço de preferências
import { getPreferences } from "../services/preferenceService";
// [MUDANÇA] PrismaClient e a função de preferências local foram removidos

export const reciveCity = async (req: Request, res: Response) => {
  try {
    const city = req.params.city;
    const array: LocationSearchResult[] = await autoComplete(city);

    const mappedArray = array.slice(0, 8).map((item, index) => ({
      id: item.id.toString(),
      name: `${item.name}, ${item.country}`,
    }));

    res.status(200).json(mappedArray);
  } catch (error) {
    console.error("Erro ao receber cidades:", error);
    // (Mantendo a correção de bug que fizemos anteriormente)
    res.status(500).json({ error: "Erro ao buscar cidades" });
  }
};

export const CurentDataById = async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    // 1. Pega o userId da query
    const userId = req.query.userId as string | undefined;

    // 2. [MUDANÇA] Busca as preferências no novo serviço
    const prefs = await getPreferences(userId);

    const data: WeatherData = await meteorologicalCurentDataById(id);

    const responseData = {
      // 3. [MUDANÇA] Ajusta a lógica para "C" (maiúsculo)
      name: data.location.name,
      country: data.location.country,
      temp: prefs.unitTemp === "C" ? data.current.temp_c : data.current.temp_f,
      feelslike:
        prefs.unitTemp === "C"
          ? data.current.feelslike_c
          : data.current.feelslike_f,
      wind:
        prefs.unitSpeed === "kph"
          ? data.current.wind_kph
          : data.current.wind_mph,
      humidity: data.current.humidity,
      condition: data.current.condition,
      speedUnit: prefs.unitSpeed,
      tempUnit: prefs.unitTemp,
      lat: data.location.lat,
      long: data.location.lon,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    res.status(500).json({ error: "Erro ao buscar dados meteorológicos" });
  }
};

export const CurentDataByLatLong = async (req: Request, res: Response) => {
  try {
    const latitude = req.query.lat as string;
    const longitude = req.query.long as string;
    // 1. Pega o userId da query
    const userId = req.query.userId as string | undefined;

    // 2. [MUDANÇA] Busca as preferências no novo serviço
    const prefs = await getPreferences(userId);

    const data: WeatherData = await meteorologicalCurentDataByLatLong(
      latitude,
      longitude
    );

    const responseData = {
      name: data.location.name,
      country: data.location.country,
      lat: data.location.lat,
      long: data.location.lon,
      temp: prefs.unitTemp === "C" ? data.current.temp_c : data.current.temp_f,
      feelslike:
        prefs.unitTemp === "C"
          ? data.current.feelslike_c
          : data.current.feelslike_f,
      wind:
        prefs.unitSpeed === "kph"
          ? data.current.wind_kph
          : data.current.wind_mph,
      humidity: data.current.humidity,
      condition: data.current.condition,
      speedUnit: prefs.unitSpeed,
      tempUnit: prefs.unitTemp,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    res.status(500).json({ error: "Erro ao buscar dados meteorológicos" });
  }
};

export const forecastDataByLatLong = async (req: Request, res: Response) => {
  try {
    const latitude = req.query.lat as string;
    const longitude = req.query.long as string;
    // 1. Pega o userId da query
    const userId = req.query.userId as string | undefined;

    // 2. [MUDANÇA] Busca as preferências no novo serviço
    const prefs = await getPreferences(userId);

    const data: ForecastDay[] = await meteorologicalForecastDataByLatLong(
      latitude,
      longitude
    );

    const responseData = data.map((day) => {
      const date = new Date(day.date_epoch * 1000);
      const dayOfWeek = date.toLocaleDateString("pt-BR", {
        weekday: "short",
        timeZone: "UTC",
      });

      return {
        day_of_week: dayOfWeek,
        // 3. [MUDANÇA] Ajusta a lógica para "C" (maiúsculo)
        avgtemp:
          prefs.unitTemp === "C"
            ? day.day.avgtemp_c.toFixed(1)
            : day.day.avgtemp_f.toFixed(1),
        condition: day.day.condition,
        tempUnit: prefs.unitTemp,
      };
    });
    console.log(responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    res.status(500).json({ error: "Erro ao buscar dados meteorológicos" });
  }
};

export const forecastDataById = async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    // 1. Pega o userId da query
    const userId = req.query.userId as string | undefined;

    // 2. [MUDANÇA] Busca as preferências no novo serviço
    const prefs = await getPreferences(userId);

    const data: ForecastDay[] = await meteorologicalForecastDataById(id);

    const responseData = data.map((day) => {
      const date = new Date(day.date_epoch * 1000);
      const dayOfWeek = date.toLocaleDateString("pt-BR", {
        weekday: "short",
        timeZone: "UTC",
      });

      return {
        day_of_week: dayOfWeek,
        // 3. [MUDANÇA] Ajusta a lógica para "C" (maiúsculo)
        avgtemp:
          prefs.unitTemp === "C"
            ? day.day.avgtemp_c.toFixed(1)
            : day.day.avgtemp_f.toFixed(1),
        condition: day.day.condition,
        tempUnit: prefs.unitTemp,
      };
    });

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    res.status(500).json({ error: "Erro ao buscar dados meteorológicos" });
  }
};
