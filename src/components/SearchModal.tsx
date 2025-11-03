// src/components/SearchModal.tsx
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

// --- Tipagem ---
interface SearchResult {
  id: string;
  name: string;
}

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  // Envia o ID e o Nome da cidade selecionada
  onSelectCity: (cityId: string, cityName: string) => void;
  onUseGps: () => void;
}

// --- Componente ---
export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectCity,
  onUseGps,
}) => {
  // --- Estados Internos do Modal ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- Efeito de Debounce da Busca ---
  useEffect(() => {
    // Limpa os resultados se a busca estiver vazia
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    // Configura o timer
    const searchTimer = setTimeout(async () => {
      try {
        // Chama a rota de autocomplete (ex: /api/londres)
        const response = await api.get(`/api/${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Erro na busca:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms de debounce

    // Função de limpeza: cancela o timer se o usuário digitar novamente
    return () => clearTimeout(searchTimer);
  }, [searchQuery]);

  // --- Funções Helper ---
  const handleSelect = (cityId: string, cityName: string) => {
    onSelectCity(cityId, cityName); // Chama a função do pai com ambos os valores
    handleClose();
  };

  const handleUseGps = () => {
    onUseGps(); // Chama a função do pai
    handleClose();
  };

  const handleClose = () => {
    setSearchQuery(""); // Limpa a busca ao fechar
    setSearchResults([]); // Limpa os resultados ao fechar
    onClose(); // Chama a função do pai para fechar o modal
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

              {/* Botão para voltar ao GPS */}
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

              {/* Input de Busca */}
              <TextInput
                style={styles.searchInput}
                placeholder="Digite o nome da cidade..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Lista de Resultados */}
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

// --- Estilos ---
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
    maxHeight: "80%", // Limita a altura
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
