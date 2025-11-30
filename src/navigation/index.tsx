import React from "react";
import {
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../contexts/AuthContext";
import { WeatherProvider } from "../contexts/WeatherContext";
import { usePushNotifications } from "../hooks/usePushNotifications";

import { LoginScreen } from "../screens/LoginScreen";
import { CadastroScreen } from "../screens/CadastroScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { CustomDrawerContent } from "../components/CustomDrawerContent";
import { ChartsScreen } from "../screens/ChartsScreen";
import { RadarScreen } from "../screens/RadarScreen";

export interface UserLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
};

export type AppTabParamList = {
  Home: { location?: UserLocation };
  Radar: undefined;
  Charts: undefined;
};

export type AppDrawerParamList = {
  MainTabs: NavigatorScreenParams<AppTabParamList>;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppDrawer = createDrawerNavigator<AppDrawerParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Cadastro" component={CadastroScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <AppTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#888",
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "help-outline";

          if (route.name === "Home") {
            iconName = "globe-outline";
          } else if (route.name === "Charts") {
            iconName = "stats-chart-outline";
          } else if (route.name === "Radar") {
            iconName = "map-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <AppTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Tempo" }}
      />

      <AppTab.Screen
        name="Radar"
        component={RadarScreen}
        options={{ title: "Radar" }}
      />

      <AppTab.Screen
        name="Charts"
        component={ChartsScreen}
        options={{ title: "Gráficos" }}
      />
    </AppTab.Navigator>
  );
}

function AppNavigator() {
  return (
    <WeatherProvider>
      <AppDrawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <AppDrawer.Screen name="MainTabs" component={MainTabNavigator} />
      </AppDrawer.Navigator>
    </WeatherProvider>
  );
}

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}

export function RootNavigator() {
  const { token, loading } = useAuth();
  usePushNotifications();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
