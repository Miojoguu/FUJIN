// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import * as Location from "expo-location";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

// 1. IMPORTA OS NOVOS TIPOS DE NAVEGAÇÃO
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
// 'DrawerScreenProps' é necessário para a tipagem composta
import { DrawerScreenProps } from "@react-navigation/drawer";
import {
  CompositeScreenProps,
  RouteProp,
  useNavigation,
  useRoute,
  DrawerActions, // <-- MUDANÇA AQUI (importado de '@react-navigation/native')
} from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import { useWeather } from "../contexts/WeatherContext"; // Importa o contexto
import api from "../services/api";
import { SearchModal } from "../components/SearchModal";
// 2. IMPORTA OS NOVOS TIPOS DO index.tsx
import {
  AppDrawerParamList,
  AppTabParamList,
  UserLocation,
} from "../navigation";

// --- Tipagem (sem mudança) ---
interface WeatherCondition {
  text: string;
  icon: string;
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
  sensacao_termica?: number;
  lat?: number;
  long?: number;
}
interface ForecastDay {
  day_of_week: string;
  avgtemp: string;
  condition: WeatherCondition;
  tempUnit: string;
}

// 3. ATUALIZA OS TIPOS DE NAVEGAÇÃO (para corrigir os erros)
type HomeScreenRouteProp = RouteProp<AppTabParamList, "Home">;

type HomeScreenNavigationProp = CompositeScreenProps<
  BottomTabScreenProps<AppTabParamList, "Home">,
  DrawerScreenProps<AppDrawerParamList, "MainTabs">
>["navigation"];

// --- Componente HomeScreen ---
export function HomeScreen() {
  const { user } = useAuth();
  // 4. ATUALIZA OS HOOKS
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const route = useRoute<HomeScreenRouteProp>();

  // 5. CORRIGE O ERRO DO CONTEXTO (como no arquivo que você me deu)
  const { setCurrentContext, homeScreenRefreshToggle } = useWeather();

  // --- (Estados da tela, sem mudança) ---
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

  const drawerLocation = route.params?.location;
  const drawerLocationId = drawerLocation?.id;

  // --- Efeito Principal (Carregar Dados do Clima) ---
  useEffect(() => {
    if (drawerLocation) {
      setOverrideDisplayName(null);
    }
    const fetchWeatherData = async () => {
      setLoading(true);
      setErrorMsg(null);
      const userId = user?.id;
      try {
        let weatherResponse;
        let forecastResponse;
        let locationId: string | null = null;
        let locationLat: number = 0;
        let locationLon: number = 0;

        if (drawerLocation) {
          const { latitude, longitude, id } = drawerLocation; // Agora lê o 'id'
          [weatherResponse, forecastResponse] = await Promise.all([
            api.get("/api/weather/latlong", {
              params: { lat: latitude, long: longitude, userId },
            }),
            api.get("/api/forecast/latlong", {
              params: { lat: latitude, long: longitude, userId },
            }),
          ]);
          locationId = id;
          locationLat = latitude;
          locationLon = longitude;
        } else if (selectedCityId) {
          [weatherResponse, forecastResponse] = await Promise.all([
            api.get("/api/weather/data", {
              params: { id: selectedCityId, userId },
            }),
            api.get("/api/forecast/data", {
              params: { id: selectedCityId, userId },
            }),
          ]);
          const weatherData: CurrentWeather = weatherResponse.data;
          if (!weatherData.lat || !weatherData.long) {
            console.warn(
              "Backend não está enviando lat/lon na rota /api/weather/data"
            );
            locationId = null;
          } else {
            locationId = null;
            locationLat = weatherData.lat;
            locationLon = weatherData.long;
          }
        } else {
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            setErrorMsg("Permissão de localização negada.");
            setLoading(false);
            return;
          }
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = location.coords;
          [weatherResponse, forecastResponse] = await Promise.all([
            api.get("/api/weather/latlong", {
              params: { lat: latitude, long: longitude, userId },
            }),
            api.get("/api/forecast/latlong", {
              params: { lat: latitude, long: longitude, userId },
            }),
          ]);
          locationId = null;
          locationLat = weatherResponse.data.lat;
          locationLon = weatherResponse.data.long;
        }

        if (locationLat && locationLon) {
          // 6. CORRIGE A CHAMADA DO CONTEXTO
          setCurrentContext(locationId, {
            latitude: locationLat,
            longitude: locationLon,
          });
        }
        const currentData = weatherResponse.data;
        currentData.sensacao_termica = currentData.feelslike;
        currentData.velo_vento = currentData.wind;
        setCurrentWeather(currentData);
        setForecast(forecastResponse.data);
      } catch (err) {
        console.error(err);
        setErrorMsg("Não foi possível carregar os dados do tempo.");
        setCurrentContext(null, null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeatherData();
  }, [
    user,
    selectedCityId,
    drawerLocationId,
    setCurrentContext,
    homeScreenRefreshToggle,
  ]);

  // --- Funções de Callback ---
  const handleSelectCity = (cityId: string, cityName: string) => {
    // 7. CORREÇÃO: (Corrige o erro 'Argument of type...')
    navigation.setParams({ location: undefined });
    setSelectedCityId(cityId);
    setOverrideDisplayName(cityName);
    setModalVisible(false);
  };
  const handleUseGps = () => {
    // 7. CORREÇÃO: (Corrige o erro 'Argument of type...')
    navigation.setParams({ location: undefined });
    setSelectedCityId(null);
    setOverrideDisplayName(null);
    setModalVisible(false);
  };

  // --- Renderização de Carregamento/Erro (sem mudança) ---
  if (loading && !currentWeather) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Carregando localização...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <TouchableOpacity
          onPress={() => {
            setErrorMsg(null);
            setSelectedCityId(selectedCityId ? selectedCityId : null);
            if (drawerLocation)
              navigation.setParams({ location: drawerLocation });
          }}
        >
          <Text style={styles.retryText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // --- Renderização Principal ---
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          {/* 8. CORREÇÃO: 'openDrawer' não existe, usamos 'dispatch' */}
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <FontAwesome5 name="bars" size={24} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.locationTitle} numberOfLines={1}>
              {overrideDisplayName
                ? overrideDisplayName
                : currentWeather
                ? `${currentWeather.name}, ${currentWeather.country}`
                : "Carregando..."}
            </Text>
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        {loading && (
          <ActivityIndicator style={styles.inlineLoading} color="#3b82f6" />
        )}

        {currentWeather && (
          <View style={styles.currentWeatherContainer}>
            <Image
              source={{ uri: `https:${currentWeather.condition.icon}` }}
              style={styles.weatherIcon}
            />
            <Text style={styles.temperature}>
              {Math.round(currentWeather.temp)}°{" "}
              {currentWeather.tempUnit.toUpperCase()}
            </Text>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Velo. vento:</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.wind} {currentWeather.speedUnit}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Humidade do ar:</Text>
                <Text style={styles.detailValue}>
                  {currentWeather.humidity}%
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Sensação térmica:</Text>
                <Text style={styles.detailValue}>
                  {Math.round(currentWeather.sensacao_termica!)}°{" "}
                  {currentWeather.tempUnit.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>Próximos 7 dias</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {forecast.map((day, index) => (
              <View style={styles.forecastItem} key={index}>
                <Text style={styles.forecastDay}>{day.day_of_week}</Text>
                <Image
                  source={{ uri: `https:${day.condition.icon}` }}
                  style={styles.forecastIcon}
                />
                <Text style={styles.forecastTemp}>
                  {Math.round(parseFloat(day.avgtemp))}°
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* 9. A 'View' 'bottomNav' foi REMOVIDA daqui */}

      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectCity={handleSelectCity}
        onUseGps={handleUseGps}
      />
    </SafeAreaView>
  );
}

// --- ESTILOS COM AJUSTE DE ALINHAMENTO ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 10,
    flexShrink: 1,
  },
  inlineLoading: {
    marginVertical: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  errorText: {
    fontSize: 16,
    color: "#D8000C",
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: "#3b82f6",
    marginTop: 10,
    fontWeight: "bold",
  },
  currentWeatherContainer: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40, // <-- AJUSTE AQUI: Adiciona espaço acima do ícone
  },
  weatherIcon: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  temperature: {
    fontSize: 88,
    fontWeight: "bold",
    color: "#333",
    marginTop: -20,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 20,
  },
  detailItem: {
    alignItems: "center",
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  forecastContainer: {
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  forecastItem: {
    backgroundColor: "#000",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginRight: 10,
    width: 100,
  },
  forecastDay: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginVertical: 5,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  bottomNav: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  navButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
