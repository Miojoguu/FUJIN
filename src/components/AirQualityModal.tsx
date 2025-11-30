import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export interface AirQualityData {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
  "gb-defra-index": number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: AirQualityData | null;
}

export const AirQualityModal: React.FC<Props> = ({
  visible,
  onClose,
  data,
}) => {
  if (!data) return null;

  const getEPAInfo = (index: number) => {
    switch (index) {
      case 1:
        return {
          label: "Boa",
          color: "#10B981",
          desc: "Qualidade do ar satisfatória.",
        };
      case 2:
        return {
          label: "Moderada",
          color: "#F59E0B",
          desc: "Aceitável, mas sensíveis devem ter atenção.",
        };
      case 3:
        return {
          label: "Ruim p/ Sensíveis",
          color: "#F97316",
          desc: "Idosos e crianças podem ser afetados.",
        };
      case 4:
        return {
          label: "Ruim",
          color: "#EF4444",
          desc: "Todos podem começar a sentir efeitos.",
        };
      case 5:
        return {
          label: "Muito Ruim",
          color: "#7F1D1D",
          desc: "Alerta de saúde. Evite exercícios.",
        };
      case 6:
        return {
          label: "Perigosa",
          color: "#450a0a",
          desc: "Risco sério para todos.",
        };
      default:
        return {
          label: "Desconhecida",
          color: "#6B7280",
          desc: "Dados indisponíveis.",
        };
    }
  };

  const epa = getEPAInfo(data["us-epa-index"]);

  const renderPollutant = (label: string, value: number, unit = "µg/m³") => (
    <View style={styles.pollutantRow}>
      <Text style={styles.pollutantLabel}>{label}</Text>
      <Text style={styles.pollutantValue}>
        {value.toFixed(1)} <Text style={styles.unit}>{unit}</Text>
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>Qualidade do Ar</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={[styles.statusCard, { backgroundColor: epa.color }]}>
                <MaterialCommunityIcons
                  name="emoticon-happy-outline"
                  size={32}
                  color="#fff"
                />
                <View style={{ marginLeft: 15, flex: 1 }}>
                  <Text style={styles.statusTitle}>{epa.label}</Text>
                  <Text style={styles.statusDesc}>{epa.desc}</Text>
                </View>
              </View>

              <Text style={styles.subtitle}>Poluentes:</Text>

              <View style={styles.pollutantsGrid}>
                {renderPollutant("PM 2.5 (Finas)", data.pm2_5)}
                {renderPollutant("PM 10 (Inaláveis)", data.pm10)}
                {renderPollutant("CO (Monóxido)", data.co)}
                {renderPollutant("O3 (Ozônio)", data.o3)}
                {renderPollutant("NO2 (Nitrogênio)", data.no2)}
                {renderPollutant("SO2 (Enxofre)", data.so2)}
              </View>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  statusDesc: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 10,
  },
  pollutantsGrid: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pollutantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  pollutantLabel: {
    fontSize: 14,
    color: "#374151",
  },
  pollutantValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111",
  },
  unit: {
    fontSize: 10,
    color: "#888",
    fontWeight: "normal",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
