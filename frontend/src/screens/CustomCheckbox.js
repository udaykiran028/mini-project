import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

const CustomCheckbox = ({ isChecked, onPress }) => {
  return (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <View style={[styles.checkbox, isChecked && styles.checked]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#2D0C57",
    alignItems: "center",
    justifyContent: "center",
  },
  checked: {
    backgroundColor: "#2D0C57",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomCheckbox;
