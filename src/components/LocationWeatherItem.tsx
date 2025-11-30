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
import { useWeatherCache } from "../hooks/useWeatherCache";

interface LocationProps {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  onPress: () => void;
  onLongPress: () => void;
  isDrawerOpen: boolean;
  refreshToggle: boolean;
  userId: string;
}

interface WeatherState {
  temp: string;
  icon: string;
  tempUnit: string;
}

const formatWeatherData = (data: any): WeatherState => {
  let iconPath = data.current?.condition?.icon;

  if (!iconPath) {
    iconPath = "//cdn.weatherapi.com/weather/64x64/day/113.png";
  }

  const fullIconUrl = iconPath.startsWith("http")
    ? iconPath
    : `https:${iconPath}`;

  return {
    temp: Math.round(data.current?.temp || 0).toString(),
    icon: fullIconUrl,
    tempUnit: (data.current?.tempUnit || "C").toUpperCase(),
  };
};

export const LocationWeatherItem: React.FC<LocationProps> = ({
  id,
  name,
  onPress,
  onLongPress,
  isDrawerOpen,
  refreshToggle,
  userId,
}) => {
  const [weather, setWeather] = useState<WeatherState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loadWeatherFromCache } = useWeatherCache();

  useEffect(() => {
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/locations/${id}/weather`, {
          params: { userId },
          timeout: 5000,
        });
        setWeather(formatWeatherData(response.data));
      } catch (err: any) {
        const cachedData = await loadWeatherFromCache(id);

        if (cachedData && cachedData.current) {
          const simulatedData = {
            current: cachedData.current,
            forecasts: cachedData.forecast,
          };
          setWeather(formatWeatherData(simulatedData));
        } else {
          setWeather(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isDrawerOpen) {
      fetchWeather();
    }
  }, [id, name, isDrawerOpen, refreshToggle, userId]);

  return (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
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
        {!isLoading && !weather && <Text style={styles.locationTemp}>--°</Text>}
      </View>
    </TouchableOpacity>
  );
};

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
    width: 40,
    height: 40,
  },
});
