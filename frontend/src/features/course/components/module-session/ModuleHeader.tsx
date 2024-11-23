import { memo, useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

interface SectionCompletion {
  sectionId: number;
  isCompleted: boolean;
  requiresQuestion: boolean;
  isViewed: boolean;
  isAnswered: boolean | null;
}

interface Progress {
  total: number;
  sections: {
    completed: number;
    total: number;
    percentage: number;
    details: SectionCompletion[];
  };
  questions: {
    completed: number;
    total: number;
    percentage: number;
  };
}

interface ModuleHeaderProps {
  moduleName: string;
  progress: Progress;
  colors: any;
}

export const ModuleHeader = memo(
  ({ moduleName, progress, colors }: ModuleHeaderProps) => {
    const progressPercentage = progress.total;
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.spring(progressAnim, {
        toValue: progressPercentage,
        useNativeDriver: false,
        tension: 20,
        friction: 7,
      }).start();
    }, [progressPercentage]);

    return (
      <View
        style={[
          styles.stickyHeader,
          { backgroundColor: colors.secondaryBackground },
        ]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="x" size={18} color={colors.icon} />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.currentProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ["0%", "100%"],
                  }),
                  backgroundColor: progressAnim.interpolate({
                    inputRange: [0, 25, 50, 75, 100],
                    outputRange: [
                      "#FF9F1C", // Dark orange
                      "#FFBF69", // Light orange
                      "#9DDFD3", // Light turquoise
                      "#31B389", // Light green
                      "#25A879", // Your success green
                    ],
                  }),
                },
              ]}
            />
            <View style={styles.progressBar} />
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  progressContainer: {
    flex: 1,
    position: "relative",
    height: 5,
  },
  stickyHeader: {
    backgroundColor: "black",
    paddingLeft: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    gap: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: "#E5E5E5",
    borderRadius: 5,
  },
  currentProgress: {
    height: 5,
    width: "50%",
    backgroundColor: "#25A879",
    borderRadius: 5,
  },
});
