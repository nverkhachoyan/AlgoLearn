import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { Text, useTheme, IconButton } from "react-native-paper";
import LottieView from "lottie-react-native";
import { useRef, useState, useEffect } from "react";
import Slider from "@react-native-community/slider";

export default function Challenges() {
  const { colors, dark } = useTheme();
  const animationRef = useRef<LottieView>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Choose animation based on theme
  const animationSource = require("@/assets/lotties/testing.lottie");

  // Define color filters for text elements based on theme
  const textColorFilters = [
    {
      keypath: "**.Rectangle 4", // Targets all text layers
      color: dark ? "red" : "black",
    },
    {
      keypath: "**.0", // Targets fill properties (often used for text)
      color: dark ? "red" : "black",
    },
    // You can add more specific layer targets if needed
    // {
    //   keypath: "Title Text", // Target specific layer by name
    //   color: dark ? "#ffffff" : "#000000",
    // },
  ];

  // You can change this to any color you want, or 'transparent' to show what's behind
  const lottieBackgroundColor = "transparent";

  const handlePlay = () => {
    setIsPlaying(true);
    animationRef.current?.play();
  };

  const handlePause = () => {
    setIsPlaying(false);
    animationRef.current?.pause();
  };

  const handleReset = () => {
    animationRef.current?.reset();
    setProgress(0);
    if (isPlaying) {
      animationRef.current?.play();
    }
  };

  const handleProgressChange = (value: number) => {
    setProgress(value);
    setIsPlaying(false);
    // Pause current animation
    animationRef.current?.pause();
  };

  // Track animation with a timer when playing
  useEffect(() => {
    let animationFrame: number;

    const updateProgress = () => {
      if (isPlaying && animationRef.current) {
        // We'll use this to update the slider position based on animation progress
        // This is a workaround since we don't have direct access to the animation progress
        setProgress((prev) => {
          // Increment slightly for visual feedback
          const next = prev + 0.01;
          // Loop back to 0 when reaching end
          return next > 1 ? 0 : next;
        });

        animationFrame = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying]);

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* Animation container with custom background */}
      <View
        style={[
          styles.animationContainer,
          { backgroundColor: lottieBackgroundColor },
        ]}
      >
        <LottieView
          ref={animationRef}
          source={animationSource}
          style={styles.lottieView}
          autoPlay={isPlaying}
          loop
          speed={1}
          colorFilters={textColorFilters}
          progress={isPlaying ? undefined : progress}
          renderMode="AUTOMATIC"
          onAnimationLoop={() => {
            if (isPlaying) {
              setProgress(0);
            }
          }}
        />
      </View>

      <View style={styles.controlsContainer}>
        <IconButton icon="skip-backward" onPress={handleReset} />
        <IconButton icon="pause" onPress={handlePause} />
        <IconButton icon="play" onPress={handlePlay} />
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          value={progress}
          onValueChange={handleProgressChange}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          style={styles.slider}
          thumbTintColor={colors.primary}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.surfaceVariant}
        />
      </View>

      <Text style={styles.title}>Challenges</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  animationContainer: {
    width: "100%",
    height: 300,
    // You can add optional styling here like borders
    // borderRadius: 12,
    // overflow: 'hidden',
  },
  lottieView: {
    width: "100%",
    height: "100%",
    // No background color here to respect transparency
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  controlsContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  sliderContainer: {
    width: "80%",
    marginBottom: 15,
  },
  slider: {
    width: "100%",
  },
});
