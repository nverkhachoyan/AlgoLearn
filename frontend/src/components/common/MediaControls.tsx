import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { SpeedSelector } from "@/src/components/common/SpeedSelector";

interface MediaControlsProps {
  isPlaying: boolean;
  progress: number;
  primaryColor: string;
  surfaceVariant: string;
  speedMultiplier: number;
  showSpeedMenu: boolean;
  speedOptions: number[];
  speedButtonRef: React.RefObject<View>;
  opacity?: Animated.Value;

  onPlayPause: () => void;
  onReset: () => void;
  onProgressChange: (value: number) => void;
  onProgressComplete: (value: number) => void;
  onSpeedToggle: () => void;
  onSpeedLongPress: () => void;
  onSpeedSelect: (speed: number) => void;
  onSpeedMenuClose: () => void;
}

/**
 * Reusable media player controls component with play/pause, reset, progress slider, and speed control
 */
export const MediaControls: React.FC<MediaControlsProps> = ({
  isPlaying,
  progress,
  primaryColor,
  surfaceVariant,
  speedMultiplier,
  showSpeedMenu,
  speedOptions,
  speedButtonRef,
  opacity = new Animated.Value(1),

  onPlayPause,
  onReset,
  onProgressChange,
  onProgressComplete,
  onSpeedToggle,
  onSpeedLongPress,
  onSpeedSelect,
  onSpeedMenuClose,
}) => {
  return (
    <Animated.View style={[styles.controlsWrapper, { opacity }]}>
      <View style={styles.minimalControls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onReset}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="restart"
            size={18}
            color={primaryColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.playPauseButton,
            { backgroundColor: primaryColor },
          ]}
          onPress={onPlayPause}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={surfaceVariant}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={onSpeedToggle}
          onLongPress={onSpeedLongPress}
          activeOpacity={0.7}
          ref={speedButtonRef}
        >
          <Text style={[styles.speedText, { color: primaryColor }]}>
            {speedMultiplier}x
          </Text>

          {showSpeedMenu && (
            <SpeedSelector
              speedOptions={speedOptions}
              currentSpeed={speedMultiplier}
              primaryColor={primaryColor}
              onSelect={onSpeedSelect}
              onClose={onSpeedMenuClose}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          value={progress}
          onValueChange={onProgressChange}
          onSlidingComplete={onProgressComplete}
          minimumValue={0}
          maximumValue={1}
          step={0.001}
          style={styles.slider}
          thumbTintColor={primaryColor}
          minimumTrackTintColor={primaryColor}
          maximumTrackTintColor={surfaceVariant}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  controlsWrapper: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  minimalControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 4,
    gap: 16,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  speedText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sliderContainer: {
    width: "100%",
    marginTop: 4,
  },
  slider: {
    width: "100%",
    height: 30,
  },
});
