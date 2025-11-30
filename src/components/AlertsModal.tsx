import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";

const alertOptions = [
  { label: "Temperatura", value: "temperature" },
  { label: "Sensação Térmica", value: "feelsLike" },
  { label: "Velocidade do Vento", value: "windSpeed" },
  { label: "Umidade", value: "humidity" },
  { label: "Chance de Chuva (mm)", value: "rainProb" },
  { label: "Índice UV", value: "uvIndex" },
  { label: "Pressão", value: "pressure" },
  { label: "Ponto de Orvalho", value: "dewPoint" },
];

const alertOperatorOptions = [
  { label: "Maior que (>)", value: "GT" },
  { label: "Maior ou igual a (>=)", value: "GTE" },
  { label: "Menor que (<)", value: "LT" },
  { label: "Menor ou igual a (<=)", value: "LTE" },
  { label: "Igual a (=)", value: "EQ" },
];

interface AlertsModalProps {
  visible: boolean;
  onClose: () => void;
  locationId: string | null;
}

export const AlertsModal: React.FC<AlertsModalProps> = ({
  visible,
  onClose,
  locationId,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [type, setType] = useState<string>("temperature");
  const [operator, setOperator] = useState<string>("GTE");
  const [threshold, setThreshold] = useState("30");

  const handleSave = async () => {
    if (!user || !locationId) return;

    const thresholdNum = parseFloat(threshold);
    if (isNaN(thresholdNum)) {
      Alert.alert("Erro", "Por favor, insira um número válido.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        locationId: locationId,
        type: type,
        threshold: thresholdNum,
        operator: operator,
      };

      await api.post(`/users/${user.id}/alerts`, payload);

      Alert.alert("Sucesso", "Alerta criado!");
      onClose();
    } catch (err) {
      console.error("Falha ao criar alerta:", err);
      Alert.alert("Erro", "Não foi possível salvar o alerta.");
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Novo Alerta</Text>

              {isLoading ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : (
                <>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={type}
                      onValueChange={(itemValue) => setType(itemValue)}
                      style={styles.picker}
                    >
                      {alertOptions.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>

                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={operator}
                      onValueChange={(itemValue) => setOperator(itemValue)}
                      style={styles.picker}
                    >
                      {alertOperatorOptions.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                        />
                      ))}
                    </Picker>
                  </View>

                  <TextInput
                    style={styles.textInput}
                    value={threshold}
                    onChangeText={setThreshold}
                    keyboardType="numeric"
                    placeholder="Valor"
                    placeholderTextColor="#888"
                  />

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

  pickerContainer: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#ccc",
    marginBottom: 15,
    justifyContent: "center",
  },
  picker: {
    width: "100%",
  },
  textInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 15,
    borderColor: "#ccc",
    borderWidth: 1.5,
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
