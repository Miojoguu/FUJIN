// apiReciveCity.ts

import axios from "axios";
import {
  LocationSearchResult,
  WeatherData,
  // As interfaces de Forecast mudaram:
  ForecastApiResponse,
  ForecastDay,
} from "../interfaces/interface_apiReciveCity";

/**
 * Busca uma lista de localizações e a retorna.
 * @returns Uma Promise que resolve com um array de localizações.
 */
export async function autoComplete(
  city: string
): Promise<LocationSearchResult[]> {
  const url = process.env.WEATHER_API_KEY_SEARCH + city;
  try {
    const response = await axios.get<LocationSearchResult[]>(url);
    return response.data;
  } catch (error) {
    console.error("Ocorreu um erro inesperado:", error);
    throw error;
  }
}

export async function meteorologicalCurentDataById(
  id: string
): Promise<WeatherData> {
  try {
    // MUDANÇA: Adicionado '&aqi=yes' para buscar dados de qualidade do ar
    const url =
      process.env.WEATHER_API_KEY_CURENT + `id:${id}` + "&lang=pt&aqi=yes";
    console.log(url);

    const response = await axios.get<WeatherData>(url);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    throw error;
  }
}

export async function meteorologicalCurentDataByLatLong(
  lat: string,
  long: string
): Promise<WeatherData> {
  try {
    // MUDANÇA: Adicionado '&aqi=yes' para buscar dados de qualidade do ar
    const url =
      process.env.WEATHER_API_KEY_CURENT +
      `${lat},${long}` + // Removido espaço extra
      "&lang=pt&aqi=yes";
    console.log(url);
    const response = await axios.get<WeatherData>(url);
    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error("Ocorreu um erro inesperado:", error);
    throw error;
  }
}

export async function meteorologicalForecastDataById(
  id: string
): Promise<ForecastDay[]> {
  // MUDANÇA: Tipo de retorno agora é ForecastDay[]
  try {
    // RECOMENDAÇÃO: Adicionar '&aqi=yes' aqui também
    const url =
      process.env.WEATHER_API_KEY_FORECAST +
      `id:${id}` +
      `&days=8&lang=pt&aqi=yes`;
    console.log(url);

    const response = await axios.get<ForecastApiResponse>(url);
    console.log(response.data);

    // MUDANÇA: Retornar o array 'forecastday' completo (sem o .map)
    // O '.slice(1)' (para pular "hoje") foi mantido.
    // Agora o serviço que chamar esta função receberá todos os dados
    // (day, astro, hour) para cada dia.
    const forecastDays: ForecastDay[] =
      response.data.forecast.forecastday.slice(1);

    return forecastDays;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    throw error;
  }
}

export async function meteorologicalForecastDataByLatLong(
  lat: string,
  long: string
): Promise<ForecastDay[]> {
  // MUDANÇA: Tipo de retorno agora é ForecastDay[]
  try {
    // RECOMENDAÇÃO: Adicionar '&aqi=yes' aqui também
    const url =
      process.env.WEATHER_API_KEY_FORECAST +
      `${lat},${long}` + // Removido espaço extra
      `&days=8&lang=pt&aqi=yes`;
    console.log(url);
    const response = await axios.get<ForecastApiResponse>(url);
    console.log(response.data);

    // MUDANÇA: Retornar o array 'forecastday' completo (sem o .map)
    const forecastDays: ForecastDay[] =
      response.data.forecast.forecastday.slice(1);

    return forecastDays;
  } catch (error) {
    console.error("Ocorreu um erro inesperado:", error);
    throw error;
  }
}

export async function getFullForecastDataByLatLong(
  lat: string,
  long: string
): Promise<ForecastApiResponse> {
  // <-- Retorna o objeto completo
  try {
    const url =
      process.env.WEATHER_API_KEY_FORECAST +
      `${lat},${long}` + // Removido espaço extra
      `&days=8&lang=pt&aqi=yes`;
    console.log(url);

    const response = await axios.get<ForecastApiResponse>(url);
    console.log(response.data);

    return response.data; // <-- Retorna o 'data' completo, não só uma parte
  } catch (error) {
    console.error("Ocorreu um erro inesperado:", error);
    throw error;
  }
}
