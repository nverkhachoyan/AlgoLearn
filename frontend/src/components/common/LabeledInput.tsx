import React, { useState } from "react";
import { View, TextInput, StyleSheet, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";

interface LabeledInputProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  scrollEnabled?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  icon,
  value,
  placeholder,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  multiline = false,
  scrollEnabled = false,
  numberOfLines = 1,
  maxLength = 100,
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container]}>
      <View style={styles.labelContainer}>
        <Feather
          name={icon}
          size={20}
          color={colors.onSurface}
          style={styles.icon}
        />
        <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      </View>

      <TextInput
        style={[
          styles.input,
          {
            borderColor: isFocused ? colors.secondaryContainer : colors.shadow,
            backgroundColor: isFocused
              ? colors.onPrimary
              : colors.primaryContainer,
            color: isFocused ? colors.onSurface : colors.secondary,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.secondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline={multiline}
        scrollEnabled={scrollEnabled}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    marginVertical: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelContainer: {
    flexDirection: "row",
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
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    paddingVertical: 20,
  },
});

export default LabeledInput;
