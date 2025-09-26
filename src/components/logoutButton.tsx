import React, { useContext } from "react";
import { TouchableOpacity, Text, Alert } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

interface LogoutButtonProps {
  style?: object;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ style }) => {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja realmente sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <TouchableOpacity onPress={handleLogout} style={style}>
      <Text style={{ color: "red", fontWeight: "bold" }}>Logout</Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;
