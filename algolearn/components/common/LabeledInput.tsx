import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";

interface LabeledInputProps {
  label: string;
  icon: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      style={[
        styles.inputContainer,
        {
          borderColor: isFocused ? colors.secondaryBackground : colors.border,
          backgroundColor: isFocused
            ? colors.inputBackgroundFocused
            : colors.inputBackground,
        },
      ]}
    >
      <Feather name={icon} size={20} color={colors.icon} style={styles.icon} />
      <Text style={[styles.label, { color: colors.textDimmed }]}>
        {label}
        {":"}
      </Text>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholderText}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    marginRight: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
});

export default LabeledInput;
