import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
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

import { useWeatherCache } from "../hooks/useWeatherCache";

import { SettingsModal } from "./SettingsModal";
import { AddLocationModal } from "./AddLocationModal";
import { LocationWeatherItem } from "./LocationWeatherItem";
import { ManageLocationModal } from "./ManageLocationModal";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AlertsModal } from "./AlertsModal";

import { NotificationsModal } from "./NotificationsModal";

import { UserLocation } from "../navigation";

export function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { navigation } = props;
  const { user, signOut } = useAuth();
  const { currentLocationCoords, triggerHomeRefresh } = useWeather();

  const { saveLocationsList, loadLocationsList, saveWeatherToCache } =
    useWeatherCache();

  const isDrawerOpen = useDrawerStatus() === "open";

  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [manageModalVisible, setManageModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<UserLocation | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertsModalVisible, setAlertsModalVisible] = useState(false);

  const [notificationsModalVisible, setNotificationsModalVisible] =
    useState(false);

  const fetchLocations = useCallback(async () => {
    if (user) {
      const currentUserId = user.id;

      setLoadingList(true);
      try {
        const response = await api.get(`/users/${currentUserId}/locations`);
        const list = response.data;

        setLocations(list);
        setLoadingList(false);

        await saveLocationsList(list);

        console.log("🔄 Iniciando sincronização em massa...");

        list.forEach(async (loc: UserLocation) => {
          try {
            const [weatherRes, forecastRes] = await Promise.all([
              api.get("/api/weather/data", {
                params: { id: loc.id, userId: currentUserId },
              }),
              api.get("/api/forecast/data", {
                params: { id: loc.id, userId: currentUserId },
              }),
            ]);

            await saveWeatherToCache(
              loc.id,
              weatherRes.data,
              forecastRes.data,
              {
                id: loc.id,
                name: loc.name,
                lat: loc.latitude,
                long: loc.longitude,
              }
            );
          } catch (syncErr) {
            console.log(`❌ Falha ao sincronizar background para ${loc.name}`);
          }
        });
      } catch (err) {
        console.error("Falha ao buscar locais (API). Tentando cache...");
        const cachedList = await loadLocationsList();
        if (cachedList && cachedList.length > 0) {
          setLocations(cachedList);
        }
        setLoadingList(false);
      }
    }
  }, [user, saveLocationsList, loadLocationsList, saveWeatherToCache]);

  useEffect(() => {
    if (isDrawerOpen) {
      fetchLocations();
    }
  }, [isDrawerOpen, fetchLocations]);

  const handleLocationPress = (location: UserLocation) => {
    navigation.navigate("MainTabs", {
      screen: "Home",
      params: { location: location },
    });
  };

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
    if (!user || !currentLocationCoords) return;
    setIsSaving(true);
    try {
      const { latitude, longitude } = currentLocationCoords;
      const response = await api.post(`/users/${user.id}/locations`, {
        name,
        latitude: String(latitude),
        longitude: String(longitude),
      });

      const newLocationId = response.data.id;
      await api.post(`/locations/${newLocationId}/refresh`);

      setAddModalVisible(false);
      Alert.alert("Sucesso!", `"${name}" foi salvo.`);
      fetchLocations();
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
      await api.delete(`/locations/${selectedLocation.id}`);
      Alert.alert("Sucesso!", `"${selectedLocation.name}" foi deletado.`);
      setDeleteModalVisible(false);
      setSelectedLocation(null);
      fetchLocations();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível deletar o local.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Locais Salvos</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              onPress={() => setNotificationsModalVisible(true)}
            >
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

        {loadingList && locations.length === 0 && (
          <ActivityIndicator style={{ margin: 20 }} color="#3b82f6" />
        )}

        {locations.map((loc) => (
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
            userId={user ? user.id : ""}
          />
        ))}
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={24} color="#D8000C" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

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

      <NotificationsModal
        visible={notificationsModalVisible}
        onClose={() => setNotificationsModalVisible(false)}
      />
    </View>
  );
}

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
