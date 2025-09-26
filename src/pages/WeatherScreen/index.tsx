import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { styles } from "./styles";
import SearchModal from "../SearchModal/index";

const SUN_ICON = require("../../assets/sun_icon.png");

const WeatherScreen: React.FC = () => {
  const [location, setLocation] = useState(""); 
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Dados do clima recebidos do modal
  const [weatherData, setWeatherData] = useState<{
    temp: number;
    feelslike: number;
    wind: number;
    humidity: number;
    condition: { text: string; icon: string };
    tempUnit: string;
    speedUnit: string;
  } | null>(null);

  // --- abrir modal automaticamente se location estiver vazio ---
  useEffect(() => {
    if (location === "") {
      setIsSearchVisible(true);
    } else {
      setIsSearchVisible(false);
    }
  }, []);

  // --- renderizar cards da previsão ---
  const dailyForecast = [
    { id: "1", day: "Friday", icon: SUN_ICON, temp: "30.3°" },
    { id: "2", day: "Saturday", icon: SUN_ICON, temp: "31.1°" },
    { id: "3", day: "Sunday", icon: SUN_ICON, temp: "28.8°" },
    { id: "4", day: "Monday", icon: SUN_ICON, temp: "32.0°" },
  ];

  const renderForecastCard = ({
    item,
  }: {
    item: (typeof dailyForecast)[0];
  }) => (
    <View style={styles.forecastCard}>
      <Text style={styles.cardDay}>{item.day}</Text>
      <Image source={item.icon} style={styles.cardIcon} />
      <Text style={styles.cardTemperature}>{item.temp}</Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="dark-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setIsSearchVisible(true)}
          >
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainInfoContainer}>
          <Text style={styles.locationText}>
            {location || "Selecione um local"}
          </Text>
          <Image
            source={{
              uri: weatherData
                ? `https:${weatherData.condition.icon}`
                : "https://cdn.weatherapi.com/weather/64x64/day/113.png",
            }}
            style={styles.mainIcon}
          />
          <Text style={styles.mainTemperature}>
            {weatherData
              ? `${weatherData.temp}° ${weatherData.tempUnit.toUpperCase()}`
              : "36.9°"}
          </Text>
          <Text style={styles.weatherCondition}>
            {weatherData ? weatherData.condition.text : "Sunny"}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🌬️</Text>
            <Text style={styles.detailText}>
              {weatherData
                ? `${weatherData.wind} ${weatherData.speedUnit.toUpperCase()}`
                : "4.3 km"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>💧</Text>
            <Text style={styles.detailText}>
              {weatherData ? `${weatherData.humidity}%` : "14%"}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🥵</Text>
            <Text style={styles.detailText}>
              {weatherData
                ? `${
                    weatherData.feelslike
                  }° ${weatherData.tempUnit.toUpperCase()}`
                : "05:09 AM"}
            </Text>
          </View>
        </View>

        <View style={styles.forecastHeader}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.forecastTitle}>Daily forecast</Text>
        </View>

        <FlatList
          data={dailyForecast}
          renderItem={renderForecastCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>

      {/* Modal de Busca */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelectLocation={(selectedLocation) => {
          setLocation(selectedLocation.name);
          setWeatherData(selectedLocation.weather); 
          setIsSearchVisible(false);
        }}
      />
    </View>
  );
};

export default WeatherScreen;
