import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "./styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IP_BACKEND } from "../../env";

type SettingsModalProps = {
  visible: boolean;
  onClose: () => void;
  cityId: string; 
  onUpdateWeather: (weatherData: any) => void; 
};

export default function SettingsModal({
  visible,
  onClose,
  cityId,
  onUpdateWeather,
}: SettingsModalProps) {
  const [tempUnit, setTempUnit] = useState<string>("c");
  const [speedUnit, setSpeedUnit] = useState<string>("kph");

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem("tempUnit").then((value) => {
        if (value) setTempUnit(value);
      });
      AsyncStorage.getItem("speedUnit").then((value) => {
        if (value) setSpeedUnit(value);
      });
    }
  }, [visible]);


  const handleSelectTemp = async (unit: string) => {
    await AsyncStorage.setItem("tempUnit", unit);
    setTempUnit(unit);
  };

  const handleSelectSpeed = async (unit: string) => {
    await AsyncStorage.setItem("speedUnit", unit);
    setSpeedUnit(unit);
  };

  const handleClose = async () => {
    onClose();

    try {
      const response = await fetch(
        `${IP_BACKEND}/api/weather/data?id=${cityId}&temp=${tempUnit}&speed=${speedUnit}`
      );
      if (!response.ok) throw new Error("Erro na requisição");

      const data = await response.json();
      onUpdateWeather(data);
    } catch (error) {
      // console.error("Erro ao atualizar dados meteorológicos:", error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Configurações</Text>

          {/* Temperatura */}
          <Text style={styles.sectionTitle}>Temperatura</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempUnit === "c" && { borderColor: "blue", borderWidth: 2 },
              ]}
              onPress={() => handleSelectTemp("c")}
            >
              <Text>Celsius (°C)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                tempUnit === "f" && { borderColor: "blue", borderWidth: 2 },
              ]}
              onPress={() => handleSelectTemp("f")}
            >
              <Text>Fahrenheit (°F)</Text>
            </TouchableOpacity>
          </View>

          {/* Velocidade do vento */}
          <Text style={styles.sectionTitle}>Velocidade do vento</Text>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                speedUnit === "kph" && { borderColor: "blue", borderWidth: 2 },
              ]}
              onPress={() => handleSelectSpeed("kph")}
            >
              <Text>Kilômetros por hora (kph)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.optionButton,
                speedUnit === "mph" && { borderColor: "blue", borderWidth: 2 },
              ]}
              onPress={() => handleSelectSpeed("mph")}
            >
              <Text>Milhas por hora (mph)</Text>
            </TouchableOpacity>
          </View>

          {/* Botão fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
