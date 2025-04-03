import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import Button from '@/src/components/Button';
import { useMemo, useState, useEffect } from 'react';
import * as Animatable from 'react-native-animatable';
import { useUser } from '@/src/features/user/hooks/useUser';
import { usePoints } from '@/src/features/user/hooks/usePoints';
import { Feather } from '@expo/vector-icons';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

const congratulatoryTitles = [
  'Congratulations!',
  'Well Done!',
  'Awesome Job!',
  'Fantastic Work!',
  'Brilliant!',
  'Way to Go!',
  'Outstanding!',
  'Excellent!',
  'Success!',
  'You Did It!',
  'Achievement Unlocked!',
  'Mission Accomplished!',
  'Superb!',
  'Bravo!',
  'Stellar Work!',
];

const getRandomTitle = () => {
  return congratulatoryTitles[Math.floor(Math.random() * congratulatoryTitles.length)];
};

const congratulatoryMessages: any = {
  achievement: [
    "Great job! You've mastered this module.",
    'Achievement unlocked! Module completed successfully.',
    "Excellent work! You've conquered this material.",
    "Bravo! You've completed another milestone in your learning journey.",
    "Success! You've added another skill to your toolkit.",
  ],
  motivation: [
    'Keep up the momentum and continue your learning journey!',
    'One step closer to becoming an expert. Keep going!',
    "Progress is the key to success. You're on the right track!",
    "Learning is a journey, not a destination. You're making great progress!",
    'Small steps lead to big achievements. Well done!',
  ],
  inspiration: [
    "Knowledge is power, and you're getting stronger every day!",
    "Every expert was once a beginner. You're on your way!",
    'Learning is the only thing the mind never exhausts, never fears, and never regrets.',
    'The more you learn, the more you grow. Keep expanding your horizons!',
    'Your dedication to learning is inspiring. Keep that fire burning!',
  ],
  challenge: [
    "Challenge accepted and conquered! What's next on your learning path?",
    "Another challenge overcome! You're building resilience and knowledge.",
    "Difficult roads often lead to beautiful destinations. You're making excellent progress!",
    'The greater the obstacle, the more glory in overcoming it. Well done!',
    "Success isn't just about what you accomplish, but what you overcome. Excellent work!",
  ],
  celebration: [
    'Time to celebrate this achievement before tackling the next challenge!',
    "Give yourself a pat on the back. You've earned it!",
    'Moments like these deserve recognition. Congratulations!',
    'Take a moment to enjoy this accomplishment before moving forward.',
    'Celebrate progress, no matter how small. You did it!',
  ],
};

const getRandomCompletionMessage = () => {
  const categories = Object.keys(congratulatoryMessages);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const messages = congratulatoryMessages[randomCategory];

  return messages[Math.floor(Math.random() * messages.length)];
};

interface RouteParams extends Record<string, string | undefined> {
  courseId: string;
  unitId: string;
  moduleId: string;
  nextModuleId?: string;
  nextUnitId?: string;
  nextUnitModuleId?: string;
  hasNext: string;
}

const shouldUpdateStreak = (lastStreakDate: string | null | undefined): boolean => {
  if (!lastStreakDate) return true;

  const today = new Date();
  const lastStreak = new Date(lastStreakDate);

  today.setHours(0, 0, 0, 0);
  lastStreak.setHours(0, 0, 0, 0);

  const diffMs = today.getTime() - lastStreak.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Streak should be updated if:
  // 1. Last active was yesterday (streak continues)
  // 2. Last active was today but we still want to ensure the streak is marked
  return diffDays === 1 || diffDays === 0;
};

export default function ModuleCongratulations() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const { colors }: { colors: Colors } = theme;
  const params = useLocalSearchParams<RouteParams | any>();
  const [completionMessage, setCompletionMessage] = useState('');
  const [completionTitle, setCompletionTitle] = useState('');
  const { user } = useUser();
  const { addModuleCompletionPoints, pointsValues } = usePoints();
  const [pointsAdded, setPointsAdded] = useState(false);
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [streakIncreased, setStreakIncreased] = useState(false);

  useEffect(() => {
    setCompletionMessage(getRandomCompletionMessage());
    setCompletionTitle(getRandomTitle());
  }, []);

  useEffect(() => {
    if (user && !pointsAdded) {
      addModuleCompletionPoints();
      setPointsAdded(true);
      const now = new Date().toISOString();

      if (!streakUpdated && shouldUpdateStreak(user.lastStreakDate)) {
        const currentStreak = user.streak || 0;

        // TODO: Fix, underyling func no longer supports updating streak
        // updateUser.mutate({
        //   streak: currentStreak + 1,
        //   lastStreakDate: now,
        // });

        setStreakUpdated(true);
        setStreakIncreased(true);
      } else if (!streakUpdated) {
        // updateUser.mutate({
        //   lastStreakDate: now,
        // });

        setStreakUpdated(true);
      }
    }
  }, [user, pointsAdded, streakUpdated, addModuleCompletionPoints]);

  const ids = useMemo(
    () => ({
      courseId: Number(params.courseId),
      unitId: Number(params.unitId),
      moduleId: Number(params.moduleId),
      nextModuleId: params.nextModuleId ? Number(params.nextModuleId) : undefined,
      nextUnitId: params.nextUnitId ? Number(params.nextUnitId) : undefined,
      nextUnitModuleId: params.nextUnitModuleId ? Number(params.nextUnitModuleId) : undefined,
      hasNext: params.hasNext === 'true',
    }),
    [params]
  );

  const handleContinue = () => {
    if (ids.hasNext && ids.nextModuleId) {
      // Navigate to the next module in the same unit
      router.replace({
        pathname: '/(protected)/course/[courseId]/module/[moduleId]',
        params: {
          courseId: ids.courseId,
          unitId: ids.unitId,
          moduleId: ids.nextModuleId,
        },
      });
    } else if (ids.nextUnitId && ids.nextUnitModuleId) {
      // Navigate to a module in the next unit
      router.replace({
        pathname: '/(protected)/course/[courseId]/module/[moduleId]',
        params: {
          courseId: ids.courseId,
          unitId: ids.nextUnitId,
          moduleId: ids.nextUnitModuleId,
        },
      });
    } else {
      // No next module or unit, go back to course
      router.replace(`/(protected)/course/${ids.courseId}`);
    }
  };

  const handleBackToCourse = () => {
    // Go directly back to course overview
    router.replace(`/(protected)/course/${ids.courseId}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Animatable.View animation="fadeIn" duration={800} style={styles.content}>
        <Animatable.View
          animation="bounceIn"
          delay={300}
          duration={1500}
          style={styles.iconContainer}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkmark, { color: colors.surface }]}>✓</Text>
          </View>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={500} duration={800}>
          <Text style={[styles.title, { color: colors.primary }]}>{completionTitle}</Text>
          <Text style={[styles.subtitle, { color: colors.onSurface }]}>
            You've successfully completed this module
          </Text>
          <Text style={[styles.message, { color: colors.onSurfaceVariant }]}>
            {completionMessage}
          </Text>

          {user && (
            <View style={styles.rewardsContainer}>
              {/* Points reward */}
              <Animatable.View animation="bounceIn" delay={1000} style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Feather name="cpu" size={24} color="#1CC0CB" />
                </View>
                <Text style={[styles.rewardLabel, { color: colors.onSurfaceVariant }]}>
                  Points earned:
                </Text>
                <Animatable.Text
                  animation="fadeIn"
                  duration={800}
                  style={[styles.rewardValue, { color: colors.primary }]}
                >
                  +{pointsValues.MODULE_COMPLETION}
                </Animatable.Text>
                <Text style={[styles.rewardTotal, { color: colors.onSurfaceVariant }]}>
                  Total: {user.cpus || 0}
                </Text>
              </Animatable.View>

              {/* Streak reward */}
              <Animatable.View animation="bounceIn" delay={1300} style={styles.rewardItem}>
                <View style={styles.rewardIconContainer}>
                  <Feather name="zap" size={24} color="#1CC0CB" />
                </View>
                <Text style={[styles.rewardLabel, { color: colors.onSurfaceVariant }]}>
                  Streak:
                </Text>
                <Animatable.Text
                  animation={streakIncreased ? 'pulse' : 'fadeIn'}
                  iterationCount={streakIncreased ? 2 : 1}
                  duration={800}
                  style={[styles.rewardValue, { color: colors.primary }]}
                >
                  {streakIncreased ? '+' : ''}
                  {user.streak || 0}
                </Animatable.Text>
                {streakIncreased && (
                  <Text style={[styles.streakMessage, { color: colors.onSurfaceVariant }]}>
                    Keep it going!
                  </Text>
                )}
              </Animatable.View>
            </View>
          )}
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={800}
          duration={800}
          style={styles.buttonsContainer}
        >
          <Button
            title={ids.hasNext ? 'Next Module' : 'Back to Course'}
            style={[styles.continueButton, { backgroundColor: colors.primary }]}
            textStyle={{ color: colors.onPrimary }}
            onPress={handleContinue}
          />

          {ids.hasNext && (
            <Button
              title="Back to Course"
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceVariant }]}
              textStyle={{ color: colors.onSurfaceVariant }}
              onPress={handleBackToCourse}
            />
          )}
        </Animatable.View>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 60,
    color: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 20,
  },
  rewardItem: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    minWidth: 120,
  },
  rewardIconContainer: {
    marginBottom: 8,
  },
  rewardLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  rewardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rewardTotal: {
    fontSize: 14,
  },
  streakMessage: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 12,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
  },
});
