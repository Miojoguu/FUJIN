import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

export const StyledInput: React.FC<TextInputProps> = (props) => {
  return (
    <TextInput style={styles.input} placeholderTextColor="#888" {...props} />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginVertical: 8,
  },
});
