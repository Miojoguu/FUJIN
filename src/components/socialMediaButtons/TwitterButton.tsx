import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { styles } from "./styles";
import twitterIcon from "../../assets/twitter.png";

interface TwitterButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const TwitterButton: React.FC<TwitterButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, style]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image source={twitterIcon} style={styles.socialIcon} />
      <Text style={styles.socialButtonText}></Text>
    </TouchableOpacity>
  );
};

export default TwitterButton;
