import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  socialButton: {
    flex: 1,
    marginHorizontal: 4, 
    height: 50, 
  },

  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },

  googleButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "500",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },

  container: {
    flex: 1,
    backgroundColor: "#f2f3f7",
    alignItems: "center",
  },

  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    padding: width * 0.05,
  },

  logoContainer: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: height * 0.04,
  },

  logoImage: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },

  title: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#333",
    marginBottom: height * 0.05,
  },

  input: {
    backgroundColor: "#fff",
    width: "100%",
    height: height * 0.065,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontSize: width * 0.04,
    color: "#333",
    marginBottom: height * 0.02,
  },

  button: {
    backgroundColor: "#4a90e2",
    width: "100%",
    height: height * 0.065,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },

  separatorText: {
    marginTop: 20,
    marginBottom: 10,
    color: "#555",
    fontSize: width * 0.04,
    fontWeight: "500",
  },

  footerContainer: {
    flexDirection: "row",
    marginTop: height * 0.03,
  },

  footerText: {
    fontSize: width * 0.035,
    color: "#999",
  },

  createAccountText: {
    fontSize: width * 0.035,
    color: "#4a90e2",
    fontWeight: "bold",
    marginLeft: 5,
  },
});
