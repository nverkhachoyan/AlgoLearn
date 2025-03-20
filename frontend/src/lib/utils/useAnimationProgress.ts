import { useState, useRef, useEffect } from "react";

interface AnimationProgressOptions {
  isPlaying: boolean;
  isDragging: boolean;
  loop: boolean;
  speed: number;
  speedMultiplier: number;
}

/**
 * Custom hook for tracking animation progress
 *
 * Handles progress updating based on estimated duration and provides methods
 * to control animation progress display
 */
export function useAnimationProgress({
  isPlaying,
  isDragging,
  loop,
  speed = 1,
  speedMultiplier = 1,
}: AnimationProgressOptions) {
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<any>(null);

  // Calculate animation progress based on time
  useEffect(() => {
    // Clear any existing interval
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    // If playing and not dragging, start tracking progress
    if (isPlaying && !isDragging) {
      // Calculate the expected duration based on speed and multiplier
      const effectiveSpeed = speed * speedMultiplier;

      // Default animation duration (adjust as needed)
      const estimatedDuration = 5000 / effectiveSpeed;

      // Update frequency (ms)
      const updateFrequency = 30;

      // Track from current position
      let startTime = Date.now();
      let startProgress = progress;

      progressInterval.current = setInterval(() => {
        // Calculate progress based on time elapsed
        const elapsedTime = Date.now() - startTime;
        const calculatedProgress =
          startProgress + elapsedTime / estimatedDuration;

        setProgress((current) => {
          // Handle loop or end of animation
          if (calculatedProgress >= 0.99) {
            if (loop) {
              // Reset for next loop
              startTime = Date.now();
              startProgress = 0;
              return 0;
            } else {
              return 1; // Hold at end for non-looping animations
            }
          }
          return calculatedProgress;
        });
      }, updateFrequency);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, isDragging, loop, speed, speedMultiplier, progress]);

  return {
    progress,
    setProgress,

    // Reset progress to beginning
    resetProgress: () => setProgress(0),

    // Set a specific progress value
    setProgressValue: (value: number) => setProgress(value),
  };
}
