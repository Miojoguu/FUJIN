import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { UserLocation } from "../navigation";

const KEY_PREFIX = "@Fujin:Weather:";
const KEY_LOCATIONS_LIST = "@Fujin:LocationsList";

export interface CacheMeta {
  id: string | null;
  name: string;
  lat: number;
  long: number;
}

export interface CachedWeatherData {
  current: any;
  forecast: any;
  meta: CacheMeta;
  timestamp: string;
}

export function useWeatherCache() {
  const saveWeatherToCache = useCallback(
    async (id: string | null, current: any, forecast: any, meta: CacheMeta) => {
      try {
        const storageKey = `${KEY_PREFIX}${id || "GPS"}`;

        const payload: CachedWeatherData = {
          current,
          forecast,
          meta,
          timestamp: new Date().toISOString(),
        };

        await AsyncStorage.setItem(storageKey, JSON.stringify(payload));
      } catch (error) {
        console.error("Erro ao salvar cache de clima:", error);
      }
    },
    []
  );

  const loadWeatherFromCache = useCallback(async (id: string | null) => {
    try {
      const storageKey = `${KEY_PREFIX}${id || "GPS"}`;
      const json = await AsyncStorage.getItem(storageKey);

      if (json) {
        return JSON.parse(json) as CachedWeatherData;
      }
      return null;
    } catch (error) {
      console.error("Erro ao ler cache de clima:", error);
      return null;
    }
  }, []);

  const saveLocationsList = useCallback(async (locations: UserLocation[]) => {
    try {
      await AsyncStorage.setItem(KEY_LOCATIONS_LIST, JSON.stringify(locations));
    } catch (error) {
      console.error("Erro lista:", error);
    }
  }, []);

  const loadLocationsList = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(KEY_LOCATIONS_LIST);
      if (json) return JSON.parse(json) as UserLocation[];
      return [];
    } catch (error) {
      return [];
    }
  }, []);

  return {
    saveWeatherToCache,
    loadWeatherFromCache,
    saveLocationsList,
    loadLocationsList,
  };
}
