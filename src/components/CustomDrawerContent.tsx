// src/components/CustomDrawerContent.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useWeather } from "../contexts/WeatherContext";
import api from "../services/api";

import { SettingsModal } from "./SettingsModal";
import { AddLocationModal } from "./AddLocationModal";
import { LocationWeatherItem } from "./LocationWeatherItem";
import { ManageLocationModal } from "./ManageLocationModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AlertsModal } from "./AlertsModal";

// 1. IMPORTAR O TIPO DO index.tsx
import { UserLocation } from "../navigation";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const { user, signOut } = useAuth();

  // 2. CORREÇÃO: Usar 'currentLocationCoords' do WeatherContext
  const { currentLocationCoords, triggerHomeRefresh } = useWeather();
  const isDrawerOpen = useDrawerStatus() === "open";

  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  // --- Estados dos Modais ---
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertsModalVisible, setAlertsModalVisible] = useState(false);

  // --- Funções: fetchLocations, useEffect ---
  const fetchLocations = useCallback(async () => {
    if (user) {
      setLoadingList(true);
      try {
        const response = await api.get(`/users/${user.id}/locations`);
        setLocations(response.data);
      } catch (err) {
        console.error("Falha ao buscar locais salvos:", err);
      } finally {
        setLoadingList(false);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchLocations();
    }
  }, [isDrawerOpen, fetchLocations]);

  // --- Funções de Ação ---

  // 3. CORREÇÃO: Navega para o TabNavigator aninhado
  const handleLocationPress = (location: UserLocation) => {
    navigation.navigate("MainTabs", {
      screen: "Home",
      params: { location: location },
    });
  };

  // 4. CORREÇÃO: Verifica 'currentLocationCoords'
  const handleOpenAddModal = () => {
    if (currentLocationCoords) {
      setAddModalVisible(true);
    } else {
      Alert.alert(
        "Não é possível salvar",
        "Você só pode salvar a sua localização atual (GPS) ou um local favorito existente."
      );
    }
  };

  const handleSaveLocation = async (name: string) => {
    // 5. CORREÇÃO: Pega lat/long de 'currentLocationCoords'
    if (!user || !currentLocationCoords) return;
    setIsSaving(true);
    try {
      const { latitude, longitude } = currentLocationCoords;
      // 1. Salva o novo local
      const response = await api.post(`/users/${user.id}/locations`, {
        name,
        latitude: String(latitude),
        longitude: String(longitude),
      });

      const newLocationId = response.data.id;

      // 2. Força a atualização do cache
      await api.post(`/locations/${newLocationId}/refresh`);

      setAddModalVisible(false);
      Alert.alert("Sucesso!", `"${name}" foi salvo.`);
      fetchLocations(); // Atualiza a lista de locais
    } catch (err) {
      Alert.alert("Erro", "Não foi possível salvar este local.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSaveSuccess = async () => {
    setSettingsModalVisible(false);
    setLoadingList(true);

    try {
      const locationIds = locations.map((loc) => loc.id);
      const refreshPromises = locationIds.map((id) =>
        api.post(`/locations/${id}/refresh`)
      );
      await Promise.all(refreshPromises);

      Alert.alert(
        "Preferências Salvas",
        "Seus locais salvos foram atualizados."
      );
    } catch (err) {
      Alert.alert("Erro", "Não foi possível atualizar todos os locais salvos.");
    } finally {
      setRefreshToggle((prev) => !prev);
      setLoadingList(false);
      triggerHomeRefresh();
    }
  };

  // --- Funções de Gerenciamento ---

  const handleOpenManageModal = (location: UserLocation) => {
    setSelectedLocation(location);
    setManageModalVisible(true);
  };

  const handleDeletePress = () => {
    setManageModalVisible(false);
    setDeleteModalVisible(true);
  };

  const handleAlertsPress = () => {
    setManageModalVisible(false);
    setAlertsModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLocation) return;

    setIsDeleting(true);
    try {
      // Chama a API de DELETE
      await api.delete(`/locations/${selectedLocation.id}`);
      Alert.alert("Sucesso!", `"${selectedLocation.name}" foi deletado.`);
      setDeleteModalVisible(false);
      setSelectedLocation(null);
      fetchLocations(); // Atualiza a lista
    } catch (err) {
      Alert.alert("Erro", "Não foi possível deletar o local.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.scrollView}>
        {/* Header da Gaveta */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Locais Salvos</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
              <Ionicons name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOpenAddModal}>
              <Ionicons name="add-circle-outline" size={28} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de Locais Salvos */}
        {loadingList && (
          <ActivityIndicator style={{ margin: 20 }} color="#3b82f6" />
        )}

        {!loadingList &&
          user &&
          locations.map((loc) => (
            <LocationWeatherItem
              key={loc.id}
              id={loc.id}
              name={loc.name}
              latitude={loc.latitude}
              longitude={loc.longitude}
              onPress={() => handleLocationPress(loc)}
              onLongPress={() => handleOpenManageModal(loc)}
              isDrawerOpen={isDrawerOpen}
              refreshToggle={refreshToggle}
              userId={user.id}
            />
          ))}
      </DrawerContentScrollView>

      {/* Rodapé (Logout) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#D8000C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modais */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onSaveSuccess={handleSettingsSaveSuccess}
      />
      <AddLocationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleSaveLocation}
        isLoading={isSaving}
      />
      <ManageLocationModal
        visible={manageModalVisible}
        onClose={() => setManageModalVisible(false)}
        onDeletePress={handleDeletePress}
        onAlertsPress={handleAlertsPress}
      />
      <DeleteConfirmModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        locationName={selectedLocation?.name || null}
      />
      <AlertsModal
        visible={alertsModalVisible}
        onClose={() => setAlertsModalVisible(false)}
        locationId={selectedLocation?.id || null}
      />
    </View>
  );
}

// --- Estilos ---
// ATUALIZAÇÃO: Os estilos do 'locationItem' foram removidos
// pois agora estão no componente LocationWeatherItem.tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: "#f9f9f9",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  headerIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 20,
    backgroundColor: "#fff",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#D8000C",
    fontWeight: "bold",
  },
});
