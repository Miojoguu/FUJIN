import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Switch,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useWeather, HourFormat } from "../contexts/WeatherContext";
import api from "../services/api";

type TempUnit = "C" | "F";
type SpeedUnit = "kph" | "mph";

interface UserPreferences {
  unitTemp: TempUnit;
  unitSpeed: SpeedUnit;
  hourFormat: HourFormat;
  simplifiedMode: boolean;
}

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onSaveSuccess,
}) => {
  const { user } = useAuth();

  const {
    setSimplifiedMode: setGlobalSimpleMode,
    setHourFormat: setGlobalHourFormat,
  } = useWeather();

  const [isLoading, setIsLoading] = useState(true);

  const [tempUnit, setTempUnit] = useState<TempUnit>("C");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("kph");
  const [hourFormat, setHourFormatState] = useState<HourFormat>("h24");
  const [localSimpleMode, setLocalSimpleMode] = useState(false);

  useEffect(() => {
    if (visible && user) {
      const fetchPreferences = async () => {
        setIsLoading(true);
        try {
          const response = await api.get(`/users/${user.id}/preferences`);
          const data: UserPreferences = response.data;
          setTempUnit(data.unitTemp);
          setSpeedUnit(data.unitSpeed);
          setHourFormatState(data.hourFormat);
          setLocalSimpleMode(data.simplifiedMode || false);
        } catch (error: any) {
          if (error.response?.status === 404) {
            setTempUnit("C");
            setSpeedUnit("kph");
            setHourFormatState("h24");
            setLocalSimpleMode(false);
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchPreferences();
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newPreferences = {
        unitTemp: tempUnit,
        unitSpeed: speedUnit,
        hourFormat: hourFormat,
        simplifiedMode: localSimpleMode,
      };

      await api.put(`/users/${user.id}/preferences`, newPreferences);

      setGlobalSimpleMode(localSimpleMode);
      setGlobalHourFormat(hourFormat);

      onSaveSuccess();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar suas preferências.");
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text style={styles.modalTitle}>Preferências</Text>

              {isLoading ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : (
                <>
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Temperatura</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          tempUnit === "C" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setTempUnit("C")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            tempUnit === "C" && styles.toggleButtonTextActive,
                          ]}
                        >
                          °C
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          tempUnit === "F" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setTempUnit("F")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            tempUnit === "F" && styles.toggleButtonTextActive,
                          ]}
                        >
                          °F
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vento</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          speedUnit === "kph" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setSpeedUnit("kph")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            speedUnit === "kph" &&
                              styles.toggleButtonTextActive,
                          ]}
                        >
                          km/h
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          speedUnit === "mph" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setSpeedUnit("mph")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            speedUnit === "mph" &&
                              styles.toggleButtonTextActive,
                          ]}
                        >
                          mph
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Formato de Hora</Text>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          hourFormat === "h12" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setHourFormatState("h12")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            hourFormat === "h12" &&
                              styles.toggleButtonTextActive,
                          ]}
                        >
                          12h (PM)
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.toggleButton,
                          hourFormat === "h24" && styles.toggleButtonActive,
                        ]}
                        onPress={() => setHourFormatState("h24")}
                      >
                        <Text
                          style={[
                            styles.toggleButtonText,
                            hourFormat === "h24" &&
                              styles.toggleButtonTextActive,
                          ]}
                        >
                          24h
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>
                      Modo Leitura Simplificada
                    </Text>
                    <Switch
                      value={localSimpleMode}
                      onValueChange={setLocalSimpleMode}
                      trackColor={{ false: "#767577", true: "#93C5FD" }}
                      thumbColor={localSimpleMode ? "#3b82f6" : "#f4f3f4"}
                    />
                  </View>

                  <View style={styles.footerRow}>
                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        styles.footerButtonSecondary,
                      ]}
                      onPress={onClose}
                    >
                      <Text style={styles.footerButtonSecondaryText}>
                        Cancelar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.footerButton, styles.footerButtonPrimary]}
                      onPress={handleSave}
                    >
                      <Text style={styles.footerButtonPrimaryText}>Salvar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
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
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  toggleButtonText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#fff",
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
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  footerButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  footerButtonSecondaryText: {
    color: "#555",
    fontWeight: "bold",
  },
  footerButtonPrimary: {
    backgroundColor: "#3b82f6",
  },
  footerButtonPrimaryText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
