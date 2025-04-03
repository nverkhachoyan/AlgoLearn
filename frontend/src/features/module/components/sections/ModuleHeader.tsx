import { memo, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderAndTabs } from '@/constants/Colors';
import { useAppTheme } from '@/src/context/ThemeContext';

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
  gradientColors: string;
}

const CIRCLE_SIZE = 40;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

export const ModuleHeader = memo(
  ({ moduleName, progress, colors, gradientColors }: ModuleHeaderProps) => {
    const { theme } = useAppTheme();
    const { dark } = theme;
    const [displayPercentage, setDisplayPercentage] = useState(0);
    const targetPercentage = Math.round(progress.total);
    const animationRef = useRef<number | null>(null);
    const circleDashoffset = CIRCLE_CIRCUMFERENCE * (1 - displayPercentage / 100);

    const getProgressColor = (percent: number) => {
      if (percent < 25) return '#FF9F1C'; // Dark orange
      if (percent < 50) return '#FFBF69'; // Light orange
      if (percent < 75) return '#9DDFD3'; // Light turquoise
      if (percent < 100) return '#31B389'; // Light green
      return '#25A879'; // Success green
    };

    const progressColor = getProgressColor(displayPercentage);

    useEffect(() => {
      if (displayPercentage === targetPercentage) return;

      const startTime = Date.now();
      const startValue = displayPercentage;
      const changeInValue = targetPercentage - startValue;
      const duration = 300; // milliseconds

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const animate = () => {
        const currentTime = Date.now() - startTime;
        const progress = Math.min(currentTime / duration, 1);
        const newValue = Math.round(startValue + changeInValue * progress);
        setDisplayPercentage(newValue);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [targetPercentage, displayPercentage]);

    return (
      <SafeAreaView
        edges={['top']}
        style={{
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          zIndex: 1,
          backgroundColor: HeaderAndTabs[dark ? 'dark' : 'light'],
        }}
      >
        <View
          style={[
            styles.container,
            {
              shadowColor: colors.shadowColor,
              backgroundColor: HeaderAndTabs[dark ? 'dark' : 'light'],
            },
          ]}
        >
          <View style={styles.headerContainer}>
            <Text style={[styles.moduleTitle, { color: colors.onSurface }]} numberOfLines={1}>
              {moduleName}
            </Text>
          </View>

          <View style={styles.rightContainer}>
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
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  headerContainer: {
    flex: 1,
    marginRight: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  progressContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '600',
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 13,
    marginBottom: 2,
    color: '#666',
  },
});
