import React, { useContext, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthProvider, AuthContext } from "./src/contexts/AuthContext";
import LoginScreen from "./src/pages/login/index";
import WeatherScreen from "./src/pages/WeatherScreen/index";
import LogoutButton from "./src/components/logoutButton";
import RegisterScreen from "./src/pages/register/index";

import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import SettingsModal from "./src/components/SettingsModal";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { token } = useContext(AuthContext);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <>
      <Stack.Navigator>
        {token ? (
          <Stack.Screen
            name="Weather"
            component={WeatherScreen}
            options={{
              headerShown: true,
              title: "",
              headerRight: () => <LogoutButton style={{ marginRight: 10 }} />,
              headerLeft: () => (
                <TouchableOpacity onPress={() => setSettingsVisible(true)}>
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color="black"
                    style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              ),
            }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* Modal de Configurações */}
      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        cityId={""}
        onUpdateWeather={function (weatherData: any): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
