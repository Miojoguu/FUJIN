import axios from "axios";
import {
  LocationSearchResult,
  WeatherData,
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

export async function meteorologicalInfos(id: string): Promise<WeatherData> {
  try {
    const url = process.env.WEATHER_API_KEY_CURENT + `id:${id}` + "&lang=pt";

    const response = await axios.get<WeatherData>(url);

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar dados meteorológicos:", error);
    throw error;
  }
}
