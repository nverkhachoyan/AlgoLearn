import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";

interface SpeedSelectorProps {
  speedOptions: number[];
  currentSpeed: number;
  primaryColor: string;
  onSelect: (speed: number) => void;
  onClose: () => void;
}

/**
 * A popup menu for selecting animation speed
 */
export const SpeedSelector: React.FC<SpeedSelectorProps> = ({
  speedOptions,
  currentSpeed,
  primaryColor,
  onSelect,
  onClose,
}) => {
  return (
    <TouchableOpacity
      style={styles.speedMenuOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.speedMenu}>
        {speedOptions.map((speed) => (
          <TouchableOpacity
            key={`speed-${speed}`}
            style={[
              styles.speedOption,
              currentSpeed === speed && styles.selectedSpeedOption,
            ]}
            onPress={() => onSelect(speed)}
          >
            <Text
              style={[
                styles.speedOptionText,
                currentSpeed === speed && {
                  color: primaryColor,
                  fontWeight: "700",
                },
              ]}
            >
              {speed}x
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  speedMenuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  speedMenu: {
    position: "absolute",
    bottom: 45,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: 180,
  },
  speedOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    margin: 4,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  selectedSpeedOption: {
    backgroundColor: "rgba(37, 57, 58, 0.66)",
  },
  speedOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
});
