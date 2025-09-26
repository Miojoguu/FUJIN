import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
});