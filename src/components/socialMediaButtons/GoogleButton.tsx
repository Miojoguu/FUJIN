import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { styles } from "./styles";
import googleIcon from "../../assets/google.png";

interface GoogleButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const GoogleButton: React.FC<GoogleButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={require("../../assets/google.png")} 
        style={styles.socialIcon}
      />
      <Text style={styles.socialButtonText}></Text>
    </TouchableOpacity>
  );
};

export default GoogleButton;
