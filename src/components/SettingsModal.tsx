// src/components/SettingsModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

// --- Tipagem (baseada no schema.prisma) ---
type TempUnit = "C" | "F"; //
type SpeedUnit = "kph" | "mph"; //
type HourFormat = "h12" | "h24"; //

interface UserPreferences {
  unitTemp: TempUnit;
  unitSpeed: SpeedUnit;
  hourFormat: HourFormat;
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
  const [isLoading, setIsLoading] = useState(true);

  // Estados para as preferências
  const [tempUnit, setTempUnit] = useState<TempUnit>("C");
  const [speedUnit, setSpeedUnit] = useState<SpeedUnit>("kph");
  const [hourFormat, setHourFormat] = useState<HourFormat>("h24");

  // Efeito para buscar as preferências quando o modal abrir
  useEffect(() => {
    if (visible && user) {
      const fetchPreferences = async () => {
        setIsLoading(true);
        try {
          // Busca as preferências salvas
          const response = await api.get(`/users/${user.id}/preferences`);
          const data: UserPreferences = response.data;
          setTempUnit(data.unitTemp);
          setSpeedUnit(data.unitSpeed);
          setHourFormat(data.hourFormat);
        } catch (error: any) {
          // Se der 404 (usuário novo sem prefs), usa os padrões
          if (error.response?.status === 404) {
            // Define padrões (baseado no schema.prisma)
            setTempUnit("C");
            setSpeedUnit("mph");
            setHourFormat("h24");
          } else {
            Alert.alert("Erro", "Não foi possível carregar suas preferências.");
          }
        } finally {
          setIsLoading(false);
        }
      };
      fetchPreferences();
    }
  }, [visible, user]);

  // Função para salvar as preferências
  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newPreferences = {
        unitTemp: tempUnit,
        unitSpeed: speedUnit,
        hourFormat: hourFormat,
      };
      // Salva as novas preferências
      await api.put(`/users/${user.id}/preferences`, newPreferences);
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
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Preferências:</Text>

              {isLoading ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : (
                <>
                  {/* Linha 1: Temperatura (C/F) */}
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
                        C
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
                        F
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Linha 2: Velocidade (kph/mph) */}
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
                          speedUnit === "kph" && styles.toggleButtonTextActive,
                        ]}
                      >
                        kph
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
                          speedUnit === "mph" && styles.toggleButtonTextActive,
                        ]}
                      >
                        mph
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Linha 3: Formato de Hora (12h/24h) */}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        hourFormat === "h12" && styles.toggleButtonActive,
                      ]}
                      onPress={() => setHourFormat("h12")}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          hourFormat === "h12" && styles.toggleButtonTextActive,
                        ]}
                      >
                        12h
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.toggleButton,
                        hourFormat === "h24" && styles.toggleButtonActive,
                      ]}
                      onPress={() => setHourFormat("h24")}
                    >
                      <Text
                        style={[
                          styles.toggleButtonText,
                          hourFormat === "h24" && styles.toggleButtonTextActive,
                        ]}
                      >
                        24h
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Linha 4: Botões de Ação */}
                  <View style={styles.footerRow}>
                    <TouchableOpacity
                      style={[
                        styles.footerButton,
                        styles.footerButtonSecondary,
                      ]}
                      onPress={onClose}
                    >
                      <Text style={styles.footerButtonSecondaryText}>
                        Fechar
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.footerButton, styles.footerButtonPrimary]}
                      onPress={handleSave}
                    >
                      <Text style={styles.footerButtonPrimaryText}>
                        Concluir
                      </Text>
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

// --- Estilos ---
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  toggleButtonText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  footerButtonSecondaryText: {
    color: "#555",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerButtonPrimary: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  footerButtonPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
