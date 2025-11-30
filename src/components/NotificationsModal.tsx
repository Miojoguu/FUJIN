import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface AlertConfig {
  id: string;
  type: string;
  threshold: number;
  operator: string;
  location: {
    name: string;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const getOperatorSymbol = (op: string) => {
  switch (op) {
    case "GT":
      return ">";
    case "GTE":
      return "≥";
    case "LT":
      return "<";
    case "LTE":
      return "≤";
    case "EQ":
      return "=";
    default:
      return op;
  }
};

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    temperature: "Temperatura",
    feelsLike: "Sensação",
    windSpeed: "Vento",
    humidity: "Umidade",
    rainProb: "Chuva",
    uvIndex: "UV",
    pressure: "Pressão",
    dewPoint: "Orvalho",
  };
  return map[type] || type;
};

export const NotificationsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await api.get(`/users/${user.id}/alerts`);
      setAlerts(response.data);
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchAlerts();
    }
  }, [visible]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);

      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o alerta.");
    }
  };

  const renderItem = ({ item }: { item: AlertConfig }) => (
    <View style={styles.alertItem}>
      <View style={styles.alertInfo}>
        <Text style={styles.locationName}>{item.location.name}</Text>
        <Text style={styles.alertDetail}>
          {getTypeLabel(item.type)} {getOperatorSymbol(item.operator)}{" "}
          {item.threshold}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => handleDelete(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
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
                <Text style={styles.modalTitle}>Seus Alertas Ativos</Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color="#3b82f6"
                  style={{ margin: 20 }}
                />
              ) : (
                <FlatList
                  data={alerts}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      Nenhum alerta configurado.
                    </Text>
                  }
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
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
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  alertItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  alertInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  alertDetail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
});
