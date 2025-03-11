import { memo, useEffect, useRef, useState } from "react";
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
    // Current displayed percentage (this will be animated)
    const [displayPercentage, setDisplayPercentage] = useState(0);

    // Target percentage from props
    const targetPercentage = Math.round(progress.total);

    // Animation frame ID for cleanup
    const animationRef = useRef<number | null>(null);

    // For the animated circle calculation
    const circleDashoffset =
      CIRCLE_CIRCUMFERENCE * (1 - displayPercentage / 100);

    // Determine progress color based on the current percentage
    const getProgressColor = (percent: number) => {
      if (percent < 25) return "#FF9F1C"; // Dark orange
      if (percent < 50) return "#FFBF69"; // Light orange
      if (percent < 75) return "#9DDFD3"; // Light turquoise
      if (percent < 100) return "#31B389"; // Light green
      return "#25A879"; // Success green
    };

    // Current progress color
    const progressColor = getProgressColor(displayPercentage);

    // Handle animation using requestAnimationFrame for smoother performance
    useEffect(() => {
      // Don't animate if already at the target
      if (displayPercentage === targetPercentage) return;

      const startTime = Date.now();
      const startValue = displayPercentage;
      const changeInValue = targetPercentage - startValue;
      const duration = 300; // milliseconds

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      // Animation function using requestAnimationFrame
      const animate = () => {
        const currentTime = Date.now() - startTime;
        const progress = Math.min(currentTime / duration, 1);

        // Simple linear easing
        const newValue = Math.round(startValue + changeInValue * progress);
        setDisplayPercentage(newValue);

        // Continue animation if not complete
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      // Start animation
      animationRef.current = requestAnimationFrame(animate);

      // Cleanup
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [targetPercentage, displayPercentage]);

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
              {/* Background circle */}
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 2}
                stroke="#E5E5E5"
                strokeWidth="4"
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={CIRCLE_RADIUS}
                cy={CIRCLE_RADIUS}
                r={CIRCLE_RADIUS - 2}
                stroke={progressColor}
                strokeWidth="4"
                fill="none"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={circleDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${CIRCLE_RADIUS} ${CIRCLE_RADIUS})`}
              />
            </Svg>
            <Text style={[styles.progressText, { color: colors.onSurface }]}>
              {displayPercentage}%
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
