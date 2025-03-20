import { useState, useRef } from "react";
import { View } from "react-native";
import LottieView from "lottie-react-native";

interface AnimationSpeedOptions {
  defaultSpeed?: number;
  speedOptions?: number[];
  onSpeedChange?: (speed: number) => void;
}

/**
 * Custom hook for controlling animation playback speed
 */
export function useAnimationSpeed({
  defaultSpeed = 1,
  speedOptions = [0.5, 1, 1.5, 2, 3, 4],
  onSpeedChange,
}: AnimationSpeedOptions = {}) {
  const [speedMultiplier, setSpeedMultiplier] = useState(defaultSpeed);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedButtonRef = useRef<View>(null);

  // Function to cycle through speed options
  const toggleSpeed = () => {
    const currentIndex = speedOptions.indexOf(speedMultiplier);
    const nextIndex = (currentIndex + 1) % speedOptions.length;
    const newSpeed = speedOptions[nextIndex];

    setSpeedMultiplier(newSpeed);
    onSpeedChange?.(newSpeed);
  };

  // Function to set a specific speed
  const selectSpeed = (speed: number) => {
    setSpeedMultiplier(speed);
    setShowSpeedMenu(false);
    onSpeedChange?.(speed);
  };

  // Function to show speed menu on long press
  const handleLongPressSpeed = () => {
    setShowSpeedMenu(true);
  };

  // Function to apply speed change to animation
  const applySpeedChange = (
    animationRef: React.RefObject<LottieView>,
    newSpeed: number,
    currentProgress: number,
    isPlaying: boolean
  ) => {
    if (animationRef.current) {
      // Remember current state
      const wasPlaying = isPlaying;

      // Reset and apply new speed
      animationRef.current.reset();

      // Apply speed change with a small delay
      setTimeout(() => {
        if (animationRef.current) {
          // Seek to where we were
          animationRef.current.play(currentProgress);

          // If it wasn't playing, pause it again
          if (!wasPlaying) {
            setTimeout(() => {
              if (animationRef.current) {
                animationRef.current.pause();
              }
            }, 5);
          }
        }
      }, 5);
    }
  };

  return {
    speedMultiplier,
    showSpeedMenu,
    speedOptions,
    speedButtonRef,
    toggleSpeed,
    selectSpeed,
    handleLongPressSpeed,
    setShowSpeedMenu,
    applySpeedChange,
  };
}
