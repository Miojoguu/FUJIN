import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from "react-native";

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  locationName: string | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading,
  locationName,
}) => {
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
              <Text style={styles.modalTitle}>
                Gostaria de deletar o local?
              </Text>
              <Text style={styles.locationName}>{locationName}</Text>

              {isLoading ? (
                <ActivityIndicator
                  size="large"
                  color="#3b82f6"
                  style={{ marginVertical: 10 }}
                />
              ) : (
                <View style={styles.footerRow}>
                  <TouchableOpacity
                    style={[styles.footerButton, styles.footerButtonSecondary]}
                    onPress={onClose}
                  >
                    <Text style={styles.footerButtonSecondaryText}>Nao</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.footerButton, styles.footerButtonPrimary]}
                    onPress={onConfirm}
                  >
                    <Text style={styles.footerButtonPrimaryText}>Sim</Text>
                  </TouchableOpacity>
                </View>
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
    textAlign: "center",
    marginBottom: 10,
  },
  locationName: {
    fontSize: 16,
    color: "#555",
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
