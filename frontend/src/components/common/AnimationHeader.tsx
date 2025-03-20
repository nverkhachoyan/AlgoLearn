import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AnimationHeaderProps {
  title?: string;
  showControls: boolean;
  onToggleControls: () => void;
  backgroundColor?: string;
}

/**
 * A macOS-style header component with red/yellow/green dots
 */
export const AnimationHeader: React.FC<AnimationHeaderProps> = ({
  title = "Animation",
  showControls,
  onToggleControls,
  backgroundColor = "#F5F5F7",
}) => {
  return (
    <View style={[styles.header, { backgroundColor }]}>
      <View style={styles.dots}>
        {/* <View style={[styles.dot, { backgroundColor: "#FF5F56" }]} />
        <View style={[styles.dot, { backgroundColor: "#FFBD2E" }]} />
        <View style={[styles.dot, { backgroundColor: "#27C93F" }]} /> */}
        <MaterialCommunityIcons
          name={showControls ? "movie-open" : "movie"}
          size={20}
          color="#8E8E93"
        />
      </View>

      <Text style={styles.headerTitle}>{title}</Text>

      <TouchableOpacity
        style={styles.controlsToggle}
        onPress={onToggleControls}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={showControls ? "chevron-up" : "chevron-down"}
          size={20}
          color="#8E8E93"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  dots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E93",
  },
  controlsToggle: {
    padding: 4,
  },
});
