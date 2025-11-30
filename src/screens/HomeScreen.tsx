import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { DrawerScreenProps } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  RouteProp,
  useNavigation,
  useRoute,
  DrawerActions,
  useIsFocused,
} from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { useWeather } from "../contexts/WeatherContext";
import api from "../services/api";
import { useWeatherCache } from "../hooks/useWeatherCache";

import { SearchModal } from "../components/SearchModal";
import { AdvancedInfo } from "../components/AdvancedInfo";
import {
  CustomizeDetailsModal,
  VisibilityConfig,
} from "../components/CustomizeDetailsModal";
import { AppDrawerParamList, AppTabParamList } from "../navigation";

interface WeatherCondition {
  text: string;
  icon: string;
}

interface AirQualityObject {
  co: number;
  no2: number;
  o3: number;
  so2: number;
  pm2_5: number;
  pm10: number;
  "us-epa-index": number;
  "gb-defra-index": number;
}

interface CurrentWeather {
  name: string;
  country: string;
  temp: number;
  feelslike: number;
  wind: number;
  humidity: number;
  condition: WeatherCondition;
  speedUnit: string;
  tempUnit: string;
  lat?: number;
  long?: number;
  uv: number;
  pressure_mb: number;
  co: number;
  wind_dir: string;
  precip_mm?: number;
  chance_of_rain?: number;
  dewpoint: number;
  air_quality_full?: AirQualityObject;
}

interface AstroData {
  sunrise: string;
  sunset: string;
}

interface ForecastDay {
  day_of_week: string;
  avgtemp: string;
  condition: WeatherCondition;
  astro?: AstroData;
}

type HomeScreenRouteProp = RouteProp<AppTabParamList, "Home">;
type HomeScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Home">,
  DrawerScreenProps<AppDrawerParamList, "MainTabs">
>["navigation"];

const DEFAULT_VISIBILITY: VisibilityConfig = {
  wind: true,
  rain: true,
  dewPoint: true,
  astro: true,
  uv: true,
  pressure: true,
  co: true,
  humidity: true,
};

const KEY_VISIBILITY = "@Fujin:AdvancedVisibility";

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();
  const isFocused = useIsFocused();

  const { setCurrentContext, homeScreenRefreshToggle } = useWeather();
  const { saveWeatherToCache, loadWeatherFromCache } = useWeatherCache();

  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather | null>(
    null
  );
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [overrideDisplayName, setOverrideDisplayName] = useState<string | null>(
    null
  );

  const [isOffline, setIsOffline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const [isSimplifiedMode, setIsSimplifiedMode] = useState(false);
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [advancedVisibility, setAdvancedVisibility] =
    useState<VisibilityConfig>(DEFAULT_VISIBILITY);

  const drawerLocation = route.params?.location;

  const mainTitle =
    overrideDisplayName || currentWeather?.name || "Localização";
  const subTitle = drawerLocation?.name;

  const handleShare = async () => {
    if (!viewShotRef.current || !viewShotRef.current.capture) {
      return;
    }

    setIsSharing(true);

    try {
      const uri = await viewShotRef.current.capture();

      if (!(await Sharing.isAvailableAsync())) {
        alert("Compartilhamento indisponível neste dispositivo");
        setIsSharing(false);
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Clima em ${mainTitle}`,
        UTI: "public.png",
      });
    } catch (error) {
      console.error("Erro ao compartilhar:", error);
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    const loadVisibility = async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY_VISIBILITY);
        if (saved) {
          setAdvancedVisibility(JSON.parse(saved));
        }
      } catch (e) {
        console.log("Erro ao carregar config visual", e);
      }
    };
    loadVisibility();
  }, []);

  const handleSaveVisibility = async (newConfig: VisibilityConfig) => {
    setAdvancedVisibility(newConfig);
    await AsyncStorage.setItem(KEY_VISIBILITY, JSON.stringify(newConfig));
  };

  useEffect(() => {
    if (user && isFocused) {
      api
        .get(`/users/${user.id}/preferences`)
        .then((res) => {
          setIsSimplifiedMode(!!res.data.simplifiedMode);
        })
        .catch((err) => console.log("Erro ao ler preferências:", err));
    }
  }, [user, isFocused, homeScreenRefreshToggle]);

  useEffect(() => {
    if (drawerLocation) setOverrideDisplayName(null);

    const fetchWeatherData = async () => {
      setLoading(true);
      setErrorMsg(null);
      setIsOffline(false);

      const userId = user?.id;
      let targetId: string | null = null;
      let targetLat = 0;
      let targetLong = 0;
      let isGpsSearch = false;

      try {
        if (drawerLocation) {
          targetId = drawerLocation.id;
          targetLat = drawerLocation.latitude;
          targetLong = drawerLocation.longitude;
        } else if (selectedCityId) {
          targetId = selectedCityId;
        } else {
          isGpsSearch = true;
          try {
            const { status } =
              await Location.requestForegroundPermissionsAsync();
            if (status === "granted") {
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
              });
              targetLat = loc.coords.latitude;
              targetLong = loc.coords.longitude;
            } else {
              setErrorMsg("Permissão de localização negada.");
              setLoading(false);
              return;
            }
          } catch (e) {
            console.log("Erro GPS/Offline:", e);
          }
        }

        let weatherResponse, forecastResponse;

        if (targetId && !drawerLocation) {
          weatherResponse = await api.get("/api/weather/data", {
            params: { id: targetId, userId },
          });
          forecastResponse = await api.get("/api/forecast/data", {
            params: { id: targetId, userId },
          });
          targetLat = weatherResponse.data.lat;
          targetLong = weatherResponse.data.long;
        } else {
          const params = { lat: targetLat, long: targetLong, userId };
          [weatherResponse, forecastResponse] = await Promise.all([
            api.get("/api/weather/latlong", { params }),
            api.get("/api/forecast/latlong", { params }),
          ]);
        }

        setCurrentContext(targetId, {
          latitude: targetLat,
          longitude: targetLong,
        });

        const raw = weatherResponse.data;
        const formattedWeather: CurrentWeather = {
          ...raw,
          uv: raw.uv ?? 0,
          pressure_mb: raw.pressure_mb ?? raw.pressure ?? 0,
          co: raw.air_quality?.co ?? 0,
          wind_dir: raw.wind_dir || raw.windDirection || "N/A",
          dewpoint: raw.dewpoint ?? 0,
          chance_of_rain: raw.chance_of_rain ?? raw.precip_mm ?? 0,
          air_quality_full: raw.air_quality,
        };

        const forecastData = forecastResponse?.data || [];

        setCurrentWeather(formattedWeather);
        setForecast(forecastData);
        setIsOffline(false);

        await saveWeatherToCache(targetId, formattedWeather, forecastData, {
          id: targetId,
          lat: targetLat,
          long: targetLong,
          name: formattedWeather.name,
        });
      } catch (err) {
        console.log(`⚠️ Falha API. Tentando Cache...`);
        const cachedData = await loadWeatherFromCache(targetId);

        if (cachedData) {
          const { meta } = cachedData;
          let isMatch = false;

          if (targetId) {
            if (meta.id === targetId) isMatch = true;
          } else if (isGpsSearch) {
            if (!meta.id) isMatch = true;
          }

          if (isMatch) {
            setCurrentWeather(cachedData.current);
            setForecast(cachedData.forecast);
            setIsOffline(true);
            setCurrentContext(meta.id, {
              latitude: meta.lat,
              longitude: meta.long,
            });
            if (cachedData.timestamp) {
              const date = new Date(cachedData.timestamp);
              setLastUpdate(
                date.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              );
            }
          } else {
            setErrorMsg(
              targetId ? "Sem conexão para este local." : "Sem conexão GPS."
            );
            setCurrentWeather(null);
          }
        } else {
          if (!currentWeather) setErrorMsg("Sem conexão.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [user, selectedCityId, drawerLocation, homeScreenRefreshToggle]);

  const handleSelectCity = (id: string, name: string) => {
    navigation.setParams({ location: undefined });
    setSelectedCityId(id);
    setOverrideDisplayName(name);
    setModalVisible(false);
  };

  const handleUseGps = () => {
    navigation.setParams({ location: undefined });
    setSelectedCityId(null);
    setOverrideDisplayName(null);
    setModalVisible(false);
  };

  const todayAstro =
    forecast.length > 0 && forecast[0].astro
      ? forecast[0].astro
      : { sunrise: "--:--", sunset: "--:--" };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Atualizando dados...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <MaterialIcons name="cloud-off" size={48} color="#ccc" />
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          onPress={() => {
            if (!drawerLocation) setSelectedCityId(null);
            if (drawerLocation) {
              navigation.setParams({ location: drawerLocation });
            } else {
              handleUseGps();
            }
          }}
        >
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={20} color="#fff" />
          <Text style={styles.offlineText}>
            Modo Offline •{" "}
            {lastUpdate ? `Salvo às ${lastUpdate}` : "Dados Antigos"}
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={styles.headerSide}
          >
            <FontAwesome5 name="bars" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.titleButton}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={styles.locationTitle} numberOfLines={1}>
                {mainTitle}
              </Text>
              {subTitle && <Text style={styles.subtitleText}>{subTitle}</Text>}
            </View>
            <FontAwesome5
              name="caret-down"
              size={14}
              color="#666"
              style={{ marginLeft: 6, marginTop: 2 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerSide}
            disabled={isSharing}
          >
            {isSharing ? (
              <ActivityIndicator color="#3b82f6" />
            ) : (
              <Feather name="share" size={24} color="#333" />
            )}
          </TouchableOpacity>
        </View>

        <ViewShot
          ref={viewShotRef}
          options={{ format: "png", quality: 0.9 }}
          style={{ backgroundColor: "#fff" }}
        >
          {currentWeather && (
            <View style={styles.mainInfo}>
              <Image
                source={{ uri: `https:${currentWeather.condition.icon}` }}
                style={styles.icon}
              />
              <Text style={styles.temp}>
                {Math.round(currentWeather.temp)}°{currentWeather.tempUnit}
              </Text>
              <Text style={styles.condition}>
                {currentWeather.condition.text}
              </Text>
              <Text style={styles.feelsLike}>
                Sensação: {Math.round(currentWeather.feelslike)}°
              </Text>
            </View>
          )}
        </ViewShot>

        <View style={styles.forecastSection}>
          <Text style={styles.sectionTitle}>Próximos Dias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast.map((day, idx) => (
              <View key={idx} style={styles.forecastCard}>
                <Text style={styles.forecastDay}>{day.day_of_week}</Text>
                <Image
                  source={{ uri: `https:${day.condition.icon}` }}
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastValue}>
                  {Math.round(parseFloat(day.avgtemp))}°
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {currentWeather && !isSimplifiedMode && (
          <>
            <View style={styles.detailsHeader}>
              <Text style={styles.sectionTitle}>Detalhes do Clima</Text>
              <TouchableOpacity onPress={() => setCustomizeModalVisible(true)}>
                <Feather name="plus-circle" size={24} color="#3b82f6" />
              </TouchableOpacity>
            </View>

            <AdvancedInfo
              uv={currentWeather.uv}
              pressure={currentWeather.pressure_mb}
              co={currentWeather.co}
              humidity={currentWeather.humidity}
              windSpeed={currentWeather.wind}
              windUnit={currentWeather.speedUnit}
              windDir={currentWeather.wind_dir}
              rainProb={currentWeather.chance_of_rain || 0}
              dewPoint={currentWeather.dewpoint}
              sunrise={todayAstro.sunrise}
              sunset={todayAstro.sunset}
              visibility={advancedVisibility}
              airQualityObj={currentWeather.air_quality_full}
            />
          </>
        )}
      </ScrollView>

      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCity={handleSelectCity}
        onUseGps={handleUseGps}
      />

      <CustomizeDetailsModal
        visible={customizeModalVisible}
        onClose={() => setCustomizeModalVisible(false)}
        currentConfig={advancedVisibility}
        onSave={handleSaveVisibility}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  headerSide: {
    width: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  titleButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitleText: { fontSize: 14, color: "#666", fontWeight: "500" },
  mainInfo: { alignItems: "center", marginBottom: 30 },
  icon: { width: 120, height: 120 },
  temp: { fontSize: 72, fontWeight: "bold", color: "#333" },
  condition: { fontSize: 20, color: "#666", marginBottom: 5 },
  feelsLike: { fontSize: 16, color: "#888" },
  forecastSection: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  forecastCard: {
    backgroundColor: "#3b82f6",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginRight: 10,
    width: 90,
  },
  forecastDay: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  forecastIcon: { width: 40, height: 40, marginVertical: 5 },
  forecastValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loadingText: { marginTop: 10, color: "#666" },
  errorText: {
    fontSize: 16,
    color: "#D8000C",
    marginBottom: 20,
    textAlign: "center",
  },
  retryText: { color: "#3b82f6", fontWeight: "bold", fontSize: 16 },
  offlineBanner: {
    backgroundColor: "#F59E0B",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 30 : 0,
  },
  offlineText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
});
