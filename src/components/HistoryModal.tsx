import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  TouchableWithoutFeedback,
  Alert,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { useWeather } from "../contexts/WeatherContext";

interface HistoryModalProps {
  visible: boolean;
  onClose: () => void;
  locationId: string | null;
  coords: { latitude: number; longitude: number } | null;
  locationName: string;
}

interface HistoryResponse {
  mode: "daily_avg" | "hourly";
  date: string;
  avgtemp?: number;
  temp?: number;
  mintemp?: number;
  maxtemp?: number;
  totalprecip?: number;
  will_it_rain?: number;
  precip?: number;
  wind?: number;
  humidity?: number;
  condition: {
    text: string;
    icon: string;
  };
  tempUnit: string;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  visible,
  onClose,
  locationId,
  coords,
  locationName,
}) => {
  const { user } = useAuth();
  const { hourFormat } = useWeather();

  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isDailyAvg, setIsDailyAvg] = useState(true);
  const [selectedHour, setSelectedHour] = useState("12");

  const [resultData, setResultData] = useState<HistoryResponse | null>(null);

  const maxDate = new Date();
  const minDate = new Date();
  minDate.setFullYear(maxDate.getFullYear() - 1);

  useEffect(() => {
    if (visible) {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      setSelectedDate(d);
      setStep("form");
      setResultData(null);
    }
  }, [visible]);

  const onChangeDate = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
    }
  };

  const formatHourLabel = (hour: number) => {
    if (hourFormat === "h24") {
      return `${hour.toString().padStart(2, "0")}:00`;
    } else {
      const suffix = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12} ${suffix}`;
    }
  };

  const formatResultHour = () => {
    const h = parseInt(selectedHour, 10);
    return formatHourLabel(h);
  };

  const handleSearch = async () => {
    if (!user || !coords) {
      Alert.alert("Erro", "Coordenadas não disponíveis.");
      return;
    }

    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split("T")[0];

      const params: any = {
        userId: user.id,
        date: dateString,
        lat: coords.latitude,
        long: coords.longitude,
      };

      if (!isDailyAvg) {
        params.hour = parseInt(selectedHour, 10);
      }

      const endpoint = "/api/history/latlong";
      const response = await api.get(endpoint, { params });
      setResultData(response.data);
      setStep("result");
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
      Alert.alert("Erro", "Não foi possível buscar os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("form");
    setResultData(null);
  };

  const renderForm = () => (
    <View>
      <Text style={styles.sectionLabel}>Escolha a Data:</Text>

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={24} color="#3b82f6" />
        <Text style={styles.dateButtonText}>
          {selectedDate.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          maximumDate={maxDate}
          minimumDate={minDate}
          onChange={onChangeDate}
          accentColor="#3b82f6"
        />
      )}

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Ver Média do Dia Completo</Text>
        <Switch
          value={isDailyAvg}
          onValueChange={setIsDailyAvg}
          trackColor={{ false: "#767577", true: "#93C5FD" }}
          thumbColor={isDailyAvg ? "#3b82f6" : "#f4f3f4"}
        />
      </View>

      {!isDailyAvg && (
        <>
          <Text style={styles.sectionLabel}>Escolha a Hora:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedHour}
              onValueChange={(itemValue) => setSelectedHour(itemValue)}
              style={styles.picker}
            >
              {Array.from({ length: 24 }).map((_, i) => (
                <Picker.Item
                  key={i}
                  label={formatHourLabel(i)}
                  value={i.toString()}
                />
              ))}
            </Picker>
          </View>
        </>
      )}

      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.searchButtonText}>Buscar Dados</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderResult = () => {
    if (!resultData) return null;

    const isDaily = resultData.mode === "daily_avg";

    return (
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <Text style={styles.resultDate}>
            {resultData.date.split("-").reverse().join("/")}
            {!isDaily && ` às ${formatResultHour()}`}
          </Text>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>
              {resultData.condition.text}
            </Text>
          </View>
        </View>

        <View style={styles.mainValueContainer}>
          <Text style={styles.mainLabel}>
            {isDaily ? "Temperatura Média" : "Temperatura"}
          </Text>
          <Text style={styles.mainValue}>
            {Math.round(isDaily ? resultData.avgtemp! : resultData.temp!)}°
            <Text style={styles.unit}>{resultData.tempUnit}</Text>
          </Text>
        </View>

        <View style={styles.grid}>
          {isDaily ? (
            <>
              <View style={[styles.card, { backgroundColor: "#FFF5F5" }]}>
                <Feather name="thermometer" size={24} color="#E53E3E" />
                <Text style={styles.cardLabel}>Máxima</Text>
                <Text style={[styles.cardValue, { color: "#E53E3E" }]}>
                  {Math.round(resultData.maxtemp!)}°
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: "#EBF8FF" }]}>
                <Feather name="thermometer" size={24} color="#3182CE" />
                <Text style={styles.cardLabel}>Mínima</Text>
                <Text style={[styles.cardValue, { color: "#3182CE" }]}>
                  {Math.round(resultData.mintemp!)}°
                </Text>
              </View>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: resultData.will_it_rain
                      ? "#F0FDF4"
                      : "#F9FAFB",
                    width: "100%",
                  },
                ]}
              >
                <Ionicons
                  name={resultData.will_it_rain ? "umbrella" : "sunny"}
                  size={24}
                  color={resultData.will_it_rain ? "#059669" : "#F59E0B"}
                />
                <Text style={styles.cardLabel}>Teve Chuva?</Text>
                <Text
                  style={[
                    styles.cardValue,
                    { color: resultData.will_it_rain ? "#059669" : "#4B5563" },
                  ]}
                >
                  {resultData.will_it_rain ? "Sim" : "Não"}
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.card}>
                <Feather name="wind" size={24} color="#6B7280" />
                <Text style={styles.cardLabel}>Vento</Text>
                <Text style={styles.cardValue}>{resultData.wind} kph</Text>
              </View>
              <View style={styles.card}>
                <Ionicons name="water-outline" size={24} color="#3B82F6" />
                <Text style={styles.cardLabel}>Umidade</Text>
                <Text style={styles.cardValue}>{resultData.humidity}%</Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#3b82f6" />
          <Text style={styles.backButtonText}>Nova Busca</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.modalTitle}>
                  {step === "form" ? "Consultar Histórico" : "Resultado"}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <Text style={styles.subtitle}>{locationName}</Text>

              {step === "form" ? renderForm() : renderResult()}
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
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
    marginBottom: 5,
  },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f9ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3b82f6",
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    height: 50,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  resultContainer: {
    alignItems: "center",
  },
  resultHeader: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resultDate: {
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  conditionBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conditionText: {
    color: "#3b82f6",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  mainValueContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  mainLabel: {
    fontSize: 14,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  mainValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#333",
  },
  unit: {
    fontSize: 24,
    color: "#888",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },
  card: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
  },
  backButtonText: {
    color: "#3b82f6",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 16,
  },
});
