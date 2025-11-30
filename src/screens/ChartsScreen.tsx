import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useWeather } from "../contexts/WeatherContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import { HistoryModal } from "../components/HistoryModal";

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
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
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
  const { currentLocationId, currentLocationCoords } = useWeather();
  const isFocused = useIsFocused();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);

  const [historyVisible, setHistoryVisible] = useState(false);
  const [locationName, setLocationName] = useState("Localização Atual");

  useEffect(() => {
    if (!isFocused || !user) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      setChartData(null);

      if (!currentLocationId && !currentLocationCoords) {
        setError("Nenhuma localização selecionada.");
        setLoading(false);
        return;
      }

      try {
        let response;

        if (currentLocationId) {
          response = await api.get(`/locations/${currentLocationId}/weather`, {
            params: { userId: user.id },
          });
        } else if (currentLocationCoords) {
          response = await api.get(`/api/weather/latlong`, {
            params: {
              lat: currentLocationCoords.latitude,
              long: currentLocationCoords.longitude,
              userId: user.id,
            },
          });
        }

        if (response?.data.name) setLocationName(response.data.name);

        const hourlyData = response?.data.forecasts?.[0]?.hourlyData;

        if (!hourlyData || hourlyData.length === 0) {
          throw { response: { status: 404 } };
        }

        const labels: string[] = [];
        const data: number[] = [];

        hourlyData.forEach((hour: any, index: number) => {
          if (index % 3 === 0) {
            labels.push(new Date(hour.time).getHours() + "h");
            data.push(Math.round(hour.temp));
          }
        });

        setChartData({
          labels,
          datasets: [{ data }],
        });
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          setError(
            "Gráficos detalhados estão disponíveis apenas para locais salvos no menu lateral."
          );
        } else {
          console.error("Falha ao buscar dados do gráfico:", err);
          setError("Não foi possível carregar o gráfico.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [currentLocationId, currentLocationCoords, isFocused, user]);

  if (!isFocused) {
    return <View style={styles.safeArea} />;
  }

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#3b82f6" />;

    if (error) return <Text style={styles.messageText}>{error}</Text>;

    if (chartData) {
      return (
        <>
          <Text style={styles.chartTitle}>Variação da Temperatura (Hoje)</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 32}
            height={220}
            yAxisSuffix="°"
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setHistoryVisible(true)}
          >
            <Ionicons name="time-outline" size={24} color="#fff" />
            <Text style={styles.historyButtonText}>Explorar Histórico</Text>
          </TouchableOpacity>
        </>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>{renderContent()}</View>

      <HistoryModal
        visible={historyVisible}
        onClose={() => setHistoryVisible(false)}
        locationId={currentLocationId}
        coords={currentLocationCoords}
        locationName={locationName}
      />
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
    lineHeight: 24,
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
  historyButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 30,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  historyButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});
