import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { VisibilityConfig } from "./CustomizeDetailsModal";
import { AirQualityModal, AirQualityData } from "./AirQualityModal";

interface AdvancedProps {
  uv: number;
  pressure: number;
  co: number;
  humidity: number;
  windSpeed: number;
  windUnit: string;
  windDir: string;
  rainProb: number;
  dewPoint: number;
  sunrise: string;
  sunset: string;
  visibility: VisibilityConfig;

  airQualityObj?: AirQualityData;
}

export const AdvancedInfo: React.FC<AdvancedProps> = ({
  uv,
  pressure,
  co,
  humidity,
  windSpeed,
  windUnit,
  windDir,
  rainProb,
  dewPoint,
  sunrise,
  sunset,
  visibility,
  airQualityObj,
}) => {
  const [airModalVisible, setAirModalVisible] = useState(false);

  const getAirQualityColor = (val: number) => {
    if (val < 300) return "#10B981";
    if (val < 1000) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <View style={styles.container}>
      <AirQualityModal
        visible={airModalVisible}
        onClose={() => setAirModalVisible(false)}
        data={airQualityObj || null}
      />

      <View style={styles.grid}>
        {visibility.wind && (
          <View style={styles.card}>
            <Feather name="wind" size={24} color="#3B82F6" />
            <Text style={styles.label}>Vento</Text>
            <Text style={styles.value}>
              {windSpeed} {windUnit}
            </Text>
            <Text style={styles.subLabel}>Direção: {windDir}</Text>
          </View>
        )}

        {visibility.rain && (
          <View style={styles.card}>
            <Ionicons name="rainy" size={24} color="#6366F1" />
            <Text style={styles.label}>Chuva</Text>
            <Text style={styles.value}>{rainProb}%</Text>
            <Text style={styles.subLabel}>Probabilidade</Text>
          </View>
        )}

        {visibility.dewPoint && (
          <View style={styles.card}>
            <Ionicons name="water-outline" size={24} color="#0EA5E9" />
            <Text style={styles.label}>Ponto de Orvalho</Text>
            <Text style={styles.value}>{Math.round(dewPoint)}°</Text>
          </View>
        )}

        {visibility.astro && (
          <View style={styles.card}>
            <Feather name="sunrise" size={24} color="#F59E0B" />
            <Text style={styles.label}>Sol</Text>
            <View style={styles.astroRow}>
              <Text style={styles.astroText}>☀️ {sunrise}</Text>
              <Text style={styles.astroText}>🌑 {sunset}</Text>
            </View>
          </View>
        )}

        {visibility.uv && (
          <View style={styles.card}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
            <Text style={styles.label}>Índice UV</Text>
            <Text style={styles.value}>{uv}</Text>
          </View>
        )}

        {visibility.pressure && (
          <View style={styles.card}>
            <MaterialCommunityIcons name="gauge" size={24} color="#6B7280" />
            <Text style={styles.label}>Pressão</Text>
            <Text style={styles.value}>{pressure} hPa</Text>
          </View>
        )}

        {visibility.co && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => airQualityObj && setAirModalVisible(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="air-filter"
              size={24}
              color={getAirQualityColor(co)}
            />
            <Text style={styles.label}>Qualidade Ar</Text>
            <Text style={[styles.value, { color: getAirQualityColor(co) }]}>
              {co ? co.toFixed(0) : "--"}
            </Text>
            <Text style={styles.subLabel}>µg/m³ (CO)</Text>
            {airQualityObj && (
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#999"
                style={{ marginTop: 5 }}
              />
            )}
          </TouchableOpacity>
        )}

        {visibility.humidity && (
          <View style={styles.card}>
            <Ionicons name="water" size={24} color="#3B82F6" />
            <Text style={styles.label}>Umidade</Text>
            <Text style={styles.value}>{humidity}%</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 110,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  subLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  astroRow: {
    marginTop: 4,
    alignItems: "center",
  },
  astroText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
  },
});
