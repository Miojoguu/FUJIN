import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../services/api";

interface SearchResult {
  id: string;
  name: string;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;

  onSelectCity: (cityId: string, cityName: string) => void;
  onUseGps: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectCity,
  onUseGps,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);

    const searchTimer = setTimeout(async () => {
      try {
        const response = await api.get(`/api/${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Erro na busca:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  const handleSelect = (cityId: string, cityName: string) => {
    onSelectCity(cityId, cityName);
    handleClose();
  };

  const handleUseGps = () => {
    onUseGps();
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Buscar Localização</Text>

              <TouchableOpacity style={styles.gpsButton} onPress={handleUseGps}>
                <Ionicons
                  name="navigate-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.gpsButtonText}>
                  Usar Localização Atual (GPS)
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.searchInput}
                placeholder="Digite o nome da cidade..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {isLoading && <ActivityIndicator color="#3b82f6" />}
              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelect(item.id, item.name)}
                  >
                    <Text style={styles.searchResultText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={() =>
                  !isLoading && searchQuery.length > 2 ? (
                    <Text style={styles.emptyText}>
                      Nenhum local encontrado.
                    </Text>
                  ) : null
                }
              />
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
    justifyContent: "flex-start",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  gpsButton: {
    flexDirection: "row",
    backgroundColor: "#3b82f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  gpsButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },
  searchInput: {
    height: 50,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 10,
  },
  searchResultItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  searchResultText: {
    fontSize: 16,
    color: "#333",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
});
