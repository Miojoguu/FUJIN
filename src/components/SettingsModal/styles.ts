import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: width * 0.85, 
    maxHeight: height * 0.7, 
    backgroundColor: "white",
    borderRadius: 16,
    padding: width * 0.05, 
  },
  title: {
    fontSize: width * 0.05,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: "600",
    marginTop: height * 0.015,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: height * 0.015,
  },
  optionButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.03,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    alignItems: "center",
  },
  optionText: {
    fontSize: width * 0.04,
  },
  closeButton: {
    marginTop: height * 0.025,
    backgroundColor: "#007AFF",
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: width * 0.045,
  },
});
