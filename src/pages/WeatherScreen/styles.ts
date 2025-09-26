// src/screens/WeatherScreen/styles.ts

import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  wrapper: {
    // flex: 1,
    backgroundColor: '#fff',
  },

  container: {
    // flex: 1,
    backgroundColor: "#fff",
    paddingTop: height * 0.01,
    paddingHorizontal: width * 0.03,
  },
  header: {
    flexDirection: "row",
    // Alterado para 'space-between' para alinhar um item em cada ponta
    justifyContent: "space-between",
    alignItems: "center",
  },
  // NOVO ESTILO ADICIONADO PARA O ÍCONE DE MENU
  menuIcon: {
    fontSize: width * 0.07,
    color: "#333",
    
  },
  locationText: {
    color: "#333",
    fontSize: width * 0.06,
    fontWeight: "500",
    marginBottom: height * 0.02,
  },
  searchButton: {
    backgroundColor: "#f0f0f0",
    padding: width * 0.02,
    borderRadius: 50,
  },
  searchIcon: {
    fontSize: width * 0.06,
    color: "#333",
  },
  mainInfoContainer: {
    alignItems: "center",
    marginTop: height * 0.04,
    marginBottom: height * 0.05,
  },
  mainIcon: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: "contain",
  },
  mainTemperature: {
    color: "#333",
    fontSize: width * 0.18,
    fontWeight: "300",
    marginTop: height * 0.01,
  },
  weatherCondition: {
    color: "#555",
    fontSize: width * 0.05,
    fontWeight: "500",
    marginTop: height * 0.01,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.03,
  },
  detailItem: {
    alignItems: "center",
  },
  detailIcon: {
    fontSize: width * 0.05,
    color: "#333",
  },
  detailText: {
    color: "#555",
    fontSize: width * 0.035,
    marginTop: height * 0.005,
  },
  forecastHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: height * 0.02,
  },
  forecastTitle: {
    color: "#333",
    fontSize: width * 0.045,
    marginLeft: width * 0.02,
  },
  forecastCard: {
    backgroundColor: "#333",
    borderRadius: 20,
    padding: width * 0.04,
    alignItems: "center",
    marginRight: width * 0.03,
    width: width * 0.22,
    height: height * 0.18,
    justifyContent: "center",
  },
  cardDay: {
    color: "#fff",
    fontSize: width * 0.04,
  },
  cardIcon: {
    width: width * 0.12,
    height: width * 0.12,
    marginVertical: height * 0.005,
  },
  cardTemperature: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "500",
  },
});
