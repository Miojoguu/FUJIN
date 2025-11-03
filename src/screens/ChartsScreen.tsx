// src/screens/ChartsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";

import { useWeather } from "../contexts/WeatherContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const screenWidth = Dimensions.get("window").width;

interface ChartData {
  labels: string[];
  datasets: [
    {
      data: number[];
    }
  ];
}

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Azul
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#3b82f6",
  },
};

export function ChartsScreen() {
  const { user } = useAuth();
  const { currentLocationId } = useWeather();
  const isFocused = useIsFocused(); // Hook para saber se a aba está visível

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  useEffect(() => {
    if (!isFocused || !user) {
      return;
    }

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      setChartData(null);

      if (!currentLocationId) {
        setError(
          "Gráficos detalhados estão disponíveis apenas para locais salvos."
        );
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(
          `/locations/${currentLocationId}/weather`,
          {
            params: { userId: user.id },
          }
        );

        const hourlyData = response.data.forecasts?.[0]?.hourlyData;
        if (!hourlyData || hourlyData.length === 0) {
          setError("Não há dados horários para este local.");
          setLoading(false);
          return;
        }

        const labels: string[] = [];
        const data: number[] = [];

        hourlyData.forEach((hour: any, index: number) => {
          if (index % 3 === 0) {
            // Pega de 3 em 3 horas
            labels.push(new Date(hour.time).getHours() + "h");
            data.push(Math.round(hour.temp));
          }
        });

        setChartData({
          labels,
          datasets: [{ data }],
        });
      } catch (err) {
        console.error("Falha ao buscar dados do gráfico:", err);
        setError("Não foi possível carregar o gráfico.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [currentLocationId, isFocused, user]);

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#3b82f6" />;
    }
    if (error) {
      return <Text style={styles.messageText}>{error}</Text>;
    }
    if (chartData) {
      return (
        <>
          <Text style={styles.chartTitle}>Variação da Temperatura</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 32} // Largura da tela com padding
            height={250}
            yAxisSuffix="°"
            chartConfig={chartConfig}
            bezier // Curva suave
            style={styles.chart}
          />
        </>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{renderContent()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  messageText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
