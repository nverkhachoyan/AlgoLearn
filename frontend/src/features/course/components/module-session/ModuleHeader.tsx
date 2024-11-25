import { memo, useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface SectionCompletion {
  sectionId: number;
  isCompleted: boolean;
  requiresQuestion: boolean;
  hasSeen: boolean;
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

const CIRCLE_SIZE = 40;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const ModuleHeader = memo(
  ({ moduleName, progress, colors }: ModuleHeaderProps) => {
    const progressPercentage = progress.total;
    const progressAnim = useRef(new Animated.Value(0)).current;
    const strokeDashoffset = progressAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [CIRCLE_CIRCUMFERENCE, 0],
    });

    const progressColor = progressAnim.interpolate({
      inputRange: [0, 25, 50, 75, 100],
      outputRange: [
        "#FF9F1C", // Dark orange
        "#FFBF69", // Light orange
        "#9DDFD3", // Light turquoise
        "#31B389", // Light green
        "#25A879", // Success green
      ],
    });

    useEffect(() => {
      Animated.spring(progressAnim, {
        toValue: progressPercentage,
        useNativeDriver: false,
        tension: 20,
        friction: 7,
      }).start();
    }, [progressPercentage]);

    const AnimatedCircle = Animated.createAnimatedComponent(Circle);

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.surface, shadowColor: colors.shadowColor },
        ]}
      >
        <View style={styles.headerContainer}>
          <Text
            style={[styles.moduleTitle, { color: colors.onSurface }]}
            numberOfLines={1}
          >
            {moduleName}
          </Text>
        </View>

        <View style={styles.rightContainer}>
          <View style={styles.statsContainer}>
            <Text style={[styles.statText, { color: colors.onSurface }]}>
              {progress.sections.completed}/{progress.sections.total} sections
            </Text>
            <Text style={[styles.statText, { color: colors.onSurface }]}>
              {progress.questions.completed}/{progress.questions.total}{" "}
              questions
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <Svg height={CIRCLE_SIZE} width={CIRCLE_SIZE}>
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 2}
                stroke="#E5E5E5"
                strokeWidth="4"
                fill="none"
              />
              <AnimatedCircle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 2}
                stroke={progressColor}
                strokeWidth="4"
                fill="none"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${CIRCLE_RADIUS} ${CIRCLE_RADIUS})`}
              />
            </Svg>
            <Text style={[styles.progressText, { color: colors.onSurface }]}>
              {Math.round(progressPercentage)}%
            </Text>
          </View>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    borderBottomEndRadius: 8,
    borderBottomStartRadius: 8,
    zIndex: 10,
  },
  headerContainer: {
    flex: 1,
    marginRight: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: {
    position: "absolute",
    fontSize: 9,
    fontWeight: "600",
  },
  statsContainer: {
    alignItems: "flex-end",
  },
  statText: {
    fontSize: 13,
    marginBottom: 2,
    color: "#666",
  },
});
