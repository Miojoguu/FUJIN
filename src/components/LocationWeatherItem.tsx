// src/components/LocationWeatherItem.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../services/api";

// Tipagem do local que o Drawer nos envia
interface LocationProps {
  id: string; // Este é o locationId
  name: string;
  latitude: number;
  longitude: number;
  onPress: () => void;
  onLongPress: () => void; // 1. Prop para o clique longo
  isDrawerOpen: boolean;
  refreshToggle: boolean;
  userId: string;
}

// Tipagem para o estado do clima
interface WeatherState {
  temp: string;
  icon: string;
  tempUnit: string;
}

// Função Helper para formatar os dados
const formatWeatherData = (data: any): WeatherState => {
  const iconUrl =
    data.forecasts?.[0]?.hourlyData?.[0]?.iconUrl ||
    "//cdn.weatherapi.com/weather/64x64/day/113.png";

  return {
    temp: Math.round(data.current.temp).toString(),
    icon: `https:${iconUrl}`,
    tempUnit: data.current.tempUnit.toUpperCase(),
  };
};

export const LocationWeatherItem: React.FC<LocationProps> = ({
  id,
  name,
  onPress,
  onLongPress, // 2. Pega a prop
  isDrawerOpen,
  refreshToggle,
  userId,
}) => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Este useEffect busca o clima para ESTE item
  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        // Tenta buscar o cache de clima existente
        const response = await api.get(`/locations/${id}/weather`, {
          params: { userId },
        });
        setWeather(formatWeatherData(response.data));
      } catch (err: any) {
        // FALHOU! Verifica se foi um 404 (Cache não existe)
        if (err.response?.status === 404) {
          console.log(`Cache não encontrado para ${name}. Criando um novo...`);
          // O cache não existe. Tenta criar um novo.
          try {
            // Chama POST /locations/{id}/refresh
            const refreshResponse = await api.post(`/locations/${id}/refresh`);
            setWeather(formatWeatherData(refreshResponse.data));
          } catch (refreshError) {
            console.error(
              `Falha ao TENTAR ATUALIZAR cache para ${name}:`,
              refreshError
            );
            setWeather(null); // Falha final
          }
        } else {
          // Foi outro erro (ex: 500)
          console.error(`Falha ao buscar clima do item ${name}:`, err);
          setWeather(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Só executa se o menu estiver aberto
    if (isDrawerOpen) {
      fetchWeather();
    }
  }, [id, name, isDrawerOpen, refreshToggle, userId]);

  return (
    // 3. Adiciona onLongPress e delayLongPress
    <TouchableOpacity
      style={styles.locationItem}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200} // Tempo em ms para ativar o long press
    >
      <Text style={styles.locationName} numberOfLines={1}>
        {name}
      </Text>

      <View style={styles.locationWeather}>
        {isLoading && <ActivityIndicator size="small" color="#3b82f6" />}
        {!isLoading && weather && (
          <>
            <Text style={styles.locationTemp}>
              {weather.temp}° {weather.tempUnit}
            </Text>
            <Image source={{ uri: weather.icon }} style={styles.weatherIcon} />
          </>
        )}
        {/* Mostra '--' se falhar */}
        {!isLoading && !weather && (
          <Text style={styles.locationTemp}>--° C</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// --- Estilos ---
const styles = StyleSheet.create({
  locationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  locationName: {
    fontSize: 18,
    color: "#333",
    flexShrink: 1,
    marginRight: 10,
  },
  locationWeather: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 80,
    justifyContent: "flex-end",
  },
  locationTemp: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 8,
  },
  weatherIcon: {
    width: 24,
    height: 24,
  },
});
