import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { styles } from "./styles";
import facebookIcon from "../../assets/facebook.png";

interface FacebookButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const FacebookButton: React.FC<FacebookButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={facebookIcon} style={styles.socialIcon} />
      <Text style={styles.socialButtonText}></Text>
    </TouchableOpacity>
  );
};

export default FacebookButton;
