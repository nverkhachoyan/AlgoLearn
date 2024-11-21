import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";

type FeatherIconName = keyof typeof Feather.glyphMap;
type FontAwesomeIconName = keyof typeof FontAwesome.glyphMap;
type IoniconsName = keyof typeof Ionicons.glyphMap;


interface ButtonProps {
  onPress: () => void;
  title?: string;
  icon?: {
    name: FeatherIconName | FontAwesomeIconName | IoniconsName;
    position: "left" | "right" | "middle";
    size?: number;
    color?: string;
    type?: "feather" | "fontawesome" | "ionicons" | "png"; // Type of icon
    src?: string; // Source if type is png
  };
  style?: ViewStyle; // Style for the Pressable
  textStyle?: TextStyle; // Style for the Text
  iconStyle?: TextStyle | {}; // Style for the Icon
}

export default function Button(props: ButtonProps) {
  const { onPress, title, icon, style, textStyle, iconStyle, ...rest } = props;
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const renderIcon = () => {
    if (!icon) return null;

    const { name, size = 20, color = "white", type = "feather", src } = icon;

    if (type === "fontawesome") {
      return (
        <FontAwesome
          name={name as FontAwesomeIconName}
          size={size}
          color={color}
          style={[styles[`icon${icon.position}`], iconStyle]}
        />
      );
    }

    if (type === "ionicons") {
      return (
        <Ionicons
          name={name as IoniconsName}
          size={size}
          color={color}
          style={[styles[`icon${icon.position}`], iconStyle]}
        />
      );
    }

    if (type === "png") {
      return (
        <Image
          source={src}
          style={[styles[`icon${icon.position}`], iconStyle]}
        />
      );
    }

    return (
      <Feather
        name={name as FeatherIconName}
        size={size}
        color={color}
        style={[styles[`icon${icon.position}`], iconStyle]}
      />
    );
  };

  return (
    <Pressable
      style={[
        styles.button,
        isPressed && styles.buttonPressed,
        isHovered && styles.buttonHovered,
        style,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      {...rest}
    >
      {icon?.position === "left" && renderIcon()}
      {title && <Text style={[styles.text, textStyle]}>{title}</Text>}
      {icon?.position === "right" && renderIcon()}
      {icon?.position === "middle" && renderIcon()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "black",
  },
  buttonPressed: {
    backgroundColor: "#333",
    transform: [{ scale: 0.95 }],
  },
  buttonHovered: {
    backgroundColor: "#555",
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  iconright: {
    marginLeft: 8,
  },
  iconleft: {
    marginRight: 8,
  },
  iconmiddle: {},
});
