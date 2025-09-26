import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { styles } from "./styles";
import { IP_BACKEND } from "../../env";

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: {
    name: string;
    weather: WeatherDataResponse;
  }) => void;
}

interface LocationResult {
  id: string;
  name: string;
}

interface WeatherDataResponse {
  temp: number;
  feelslike: number;
  wind: number;
  humidity: number;
  condition: {
    text: string;
    icon: string;
  };
  tempUnit: string;
  speedUnit: string;
}

const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectLocation,
}) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // --- Função para buscar cidades no backend ---
  const handleSearchSubmit = async () => {
    const query = searchText.trim();
    if (!query) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${IP_BACKEND}/api/${encodeURIComponent(query)}`
      );
      const data: LocationResult[] = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Função para buscar dados meteorológicos ---
  const fetchWeatherData = async (
    locationId: string
  ): Promise<WeatherDataResponse | null> => {
    try {
      const storedTemp = (await AsyncStorage.getItem("tempUnit")) || "";
      const storedSpeed = (await AsyncStorage.getItem("speedUnit")) || "";

      const response = await fetch(
        `${IP_BACKEND}/api/weather/data?id=${encodeURIComponent(
          locationId
        )}&temp=${storedTemp}&speed=${storedSpeed}`
      );
      if (!response.ok) throw new Error("Erro na requisição");
      const data: WeatherDataResponse = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados meteorológicos:", error);
      return null;
    }
  };

  // --- Função para selecionar local ---
  const handleSelect = async (locationName: string, locationId: string) => {
    setSelectedLocation(locationName);

    const weatherData = await fetchWeatherData(locationId);
    if (!weatherData) {
      Alert.alert("Erro ao buscar dados do clima");
      return;
    }

    onSelectLocation({ name: locationName, weather: weatherData });

    onClose();
  };

  // --- Função para fechar modal ---
  const handleClose = () => {
    if (!selectedLocation) {
      Alert.alert("Escolha um local");
      return;
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable
          style={styles.modalContent}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Barra de busca */}
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Search for a city..."
              placeholderTextColor="#aaa"
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearchSubmit}>
              <Text style={styles.searchIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de resultados */}
          {loading ? (
            <ActivityIndicator size="large" color="#000" />
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelect(item.name, item.id)}
                >
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.resultText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default SearchModal;
