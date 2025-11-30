import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

export interface VisibilityConfig {
  wind: boolean;
  rain: boolean;
  dewPoint: boolean;
  astro: boolean;
  uv: boolean;
  pressure: boolean;
  co: boolean;
  humidity: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  currentConfig: VisibilityConfig;
  onSave: (newConfig: VisibilityConfig) => void;
}

const options = [
  { key: "wind", label: "Vento" },
  { key: "rain", label: "Chuva" },
  { key: "dewPoint", label: "Ponto de Orvalho" },
  { key: "astro", label: "Sol (Nascer/Pôr)" },
  { key: "uv", label: "Índice UV" },
  { key: "pressure", label: "Pressão" },
  { key: "co", label: "Qualidade do Ar" },
  { key: "humidity", label: "Umidade" },
];

export const CustomizeDetailsModal: React.FC<Props> = ({
  visible,
  onClose,
  currentConfig,
  onSave,
}) => {
  const [config, setConfig] = useState<VisibilityConfig>(currentConfig);

  useEffect(() => {
    if (visible) {
      setConfig(currentConfig);
    }
  }, [visible, currentConfig]);

  const toggleSwitch = (key: keyof VisibilityConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onSave(config);
    onClose();
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
              <Text style={styles.modalTitle}>Personalizar Dados</Text>
              <Text style={styles.subtitle}>
                Escolha o que exibir na tela inicial
              </Text>

              <ScrollView style={{ maxHeight: 400 }}>
                {options.map((opt) => (
                  <View key={opt.key} style={styles.row}>
                    <Text style={styles.label}>{opt.label}</Text>
                    <Switch
                      value={config[opt.key as keyof VisibilityConfig]}
                      onValueChange={() =>
                        toggleSwitch(opt.key as keyof VisibilityConfig)
                      }
                      trackColor={{ false: "#767577", true: "#93C5FD" }}
                      thumbColor={
                        config[opt.key as keyof VisibilityConfig]
                          ? "#3b82f6"
                          : "#f4f3f4"
                      }
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 16,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
