// src/components/AddLocationModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { StyledInput } from "./StyledInput"; // Reutilizando nosso input

interface AddLocationModalProps {
  visible: boolean;
  onClose: () => void;
  // Função que será chamada com o nome que o usuário digitou
  onSave: (name: string) => void;
  isLoading: boolean;
}

export const AddLocationModal: React.FC<AddLocationModalProps> = ({
  visible,
  onClose,
  onSave,
  isLoading,
}) => {
  const [name, setName] = useState("");

  // Limpa o nome quando o modal é fechado
  useEffect(() => {
    if (!visible) {
      setName("");
    }
  }, [visible]);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    } else {
      Alert.alert("Nome inválido", "Por favor, digite um nome para o local.");
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
              <Text style={styles.modalTitle}>Nome do Local</Text>

              {/* Input para o Nome */}
              <StyledInput
                placeholder="Ex: Casa, Trabalho..."
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              {/* Botões de Ação */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  style={[styles.footerButton, styles.footerButtonSecondary]}
                  onPress={onClose}
                  disabled={isLoading}
                >
                  <Text style={styles.footerButtonSecondaryText}>Fechar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerButton, styles.footerButtonPrimary]}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  <Text style={styles.footerButtonPrimaryText}>
                    {isLoading ? "Salvando..." : "Concluir"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// --- Estilos (baseados no SettingsModal) ---
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
