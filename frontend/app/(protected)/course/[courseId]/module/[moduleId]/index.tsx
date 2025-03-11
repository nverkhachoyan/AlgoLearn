import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { StyleSheet, ViewToken, View, Animated } from "react-native";
import { ActivityIndicator, Text, useTheme } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import SectionsList from "@/src/features/course/components/module-session/SectionsList";
import Button from "@/src/components/common/Button";
import { useModuleProgress } from "@/src/features/module/hooks/useModules";
import { isQuestionSection, Section } from "@/src/features/module/types";
import { ModuleHeader } from "@/src/features/course/components/module-session/ModuleHeader";
import { ModuleFooter } from "@/src/features/course/components/module-session/ModuleFooter";
import { useModuleProgressInit } from "@/src/features/module/hooks/useModuleProgressInit";
import { Colors } from "@/constants/Colors";
import useToast from "@/src/hooks/useToast";
import { UseModuleProgressReturn } from "@/src/features/module/hooks/useModules";
import { usePoints } from "@/src/features/user/hooks/usePoints";

const SECTION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
} as const;

// Create a component for the animated section
const AnimatedSection = ({
  children,
  index,
  isQuestionUpdate = false,
}: {
  children: React.ReactNode;
  index: number;
  isQuestionUpdate?: boolean;
}) => {
  // Create a ref to track if this component has already been animated
  const hasAnimated = useRef(false);
  const fadeAnim = useRef(new Animated.Value(isQuestionUpdate ? 1 : 0)).current;
  const translateY = useRef(
    new Animated.Value(isQuestionUpdate ? 0 : 20)
  ).current;
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Skip animation if this is a question update or if we've already animated
    if (isQuestionUpdate || hasAnimated.current) {
      // For question updates, ensure values are set to their final state
      fadeAnim.setValue(1);
      translateY.setValue(0);
      return;
    }

    // Mark as animated to prevent future animations for this instance
    hasAnimated.current = true;

    // For initial viewport items (first few sections), show them immediately
    const initialViewportThreshold = 3; // First 3 items appear immediately
    const shouldAnimateImmediately = index < initialViewportThreshold;

    const duration = 400; // Reduced from 600ms to 400ms
    const baseDelay = 50; // Reduced from 150ms to 50ms

    if (shouldAnimateImmediately && isInitialRender) {
      // Items in the initial viewport get no animation or very minimal animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsInitialRender(false);
      });
    } else {
      // Other items get staggered animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: duration,
          delay: index * baseDelay,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          delay: index * baseDelay,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [fadeAnim, translateY, index, isInitialRender, isQuestionUpdate]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const MESSAGES = {
  ERROR: "An error occurred while loading the module",
  COMPLETE_BUTTON: "Complete Module",
} as const;

interface RouteParams extends Record<string, string | undefined> {
  courseId: string;
  unitId: string;
  moduleId: string;
}

export default function ModuleSession() {
  const router = useRouter();
  const { colors }: { colors: Colors } = useTheme();
  const params = useLocalSearchParams<RouteParams | any>();
  const [isCompleting, setIsCompleting] = useState(false);
  const { showToast } = useToast();
  const { addPoints, pointsValues } = usePoints();
  const ids = useMemo(
    () => ({
      courseId: Number(params.courseId),
      unitId: Number(params.unitId),
      moduleId: Number(params.moduleId),
    }),
    [params]
  );
  const {
    currentModule,
    hasNextModule,
    nextModuleId,
    hasPrevModule,
    prevModuleId,
    nextUnitId,
    hasNextUnit,
    prevUnitId,
    hasPrevUnit,
    nextUnitModuleId,
    hasNextUnitModule,
    prevUnitModuleId,
    hasPrevUnitModule,
    completeModuleMutation,
    isPending,
    error,
  }: UseModuleProgressReturn = useModuleProgress({
    courseId: ids.courseId,
    unitId: ids.unitId,
    moduleId: ids.moduleId,
  });
  const { moduleProgress, setModuleProgress } =
    useModuleProgressInit(currentModule);
  const sortedSections: Section[] = useMemo(
    () =>
      currentModule?.sections
        ?.slice()
        .sort((a: any, b: any) => a.position - b.position) ?? [],
    [currentModule?.sections]
  );

  const handleQuestionAnswer = useCallback(
    (
      questionId: number,
      optionId: number | null,
      isCorrect: boolean | null
    ) => {
      setModuleProgress((prev) => {
        const newQuestions = new Map(prev.questions);
        newQuestions.set(questionId, {
          questionId,
          hasAnswered: true,
          optionId,
          isCorrect,
          answeredAt: new Date().toISOString(),
        });

        const newState = {
          ...prev,
          questions: newQuestions,
        };

        return newState;
      });
    },
    [setModuleProgress]
  );

  const handleViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<ViewToken & { item: Section }>;
    }) => {
      const now = new Date().toISOString();

      setModuleProgress((prev) => {
        const newSections = new Map(prev.sections);

        viewableItems.forEach((viewableItem) => {
          if (viewableItem.isViewable) {
            const section = viewableItem.item;
            if (!prev.sections.has(section.id)) {
              newSections.set(section.id, {
                sectionId: section.id,
                hasSeen: true,
                seenAt: now,
                startedAt: now,
                completedAt: section.type !== "question" ? now : null,
              });
            }
          }
        });

        return newSections.size !== prev.sections.size
          ? { ...prev, sections: newSections }
          : prev;
      });
    },
    [setModuleProgress]
  );

  const calculateProgress = useMemo(() => {
    const { sections, questions } = moduleProgress;
    const totalSections = sortedSections.length;

    const completedSections = sortedSections.map((section: any) => {
      const progress = sections.get(section.id);
      const hasSeen = Boolean(progress?.hasSeen);

      if (section.type === "question") {
        const questionState = questions.get(section.content.id);
        const isComplete = hasSeen && Boolean(questionState?.hasAnswered);

        return {
          sectionId: section.id,
          isCompleted: isComplete,
          requiresQuestion: true,
          hasSeen,
          isAnswered: Boolean(questionState?.hasAnswered),
          needsProgressUpdate: isComplete && !progress?.completedAt,
        };
      }

      const isComplete = Boolean(progress?.hasSeen);

      return {
        sectionId: section.id,
        isCompleted: isComplete,
        requiresQuestion: false,
        hasSeen,
        isAnswered: null,
        needsProgressUpdate: false,
      };
    });

    const completedCount = completedSections.filter(
      (s: any) => s.isCompleted
    ).length;

    const totalProgress =
      totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

    const answeredQuestions = Array.from(questions.values()).filter(
      (q) => q.hasAnswered
    ).length;
    const questionProgress =
      questions.size > 0 ? (answeredQuestions / questions.size) * 100 : 0;

    return {
      total: totalProgress,
      sections: {
        completed: completedCount,
        total: totalSections,
        percentage: totalProgress,
        details: completedSections,
      },
      questions: {
        completed: answeredQuestions,
        total: questions.size,
        percentage: questionProgress,
      },
    };
  }, [moduleProgress, sortedSections]);

  const handleModuleCompletion = async () => {
    if (isCompleting) return;

    try {
      const { questions, sections } = moduleProgress;

      if (sortedSections.length > 0) {
        const unansweredQuestions = Array.from(questions.values()).filter(
          (question) => !question.hasAnswered
        );
        const unseenSections = Array.from(sections.values()).filter(
          (section) => !section.hasSeen
        );

        if (unansweredQuestions.length > 0) {
          showToast(
            "Please answer all questions before completing the module."
          );
          return;
        }

        if (unseenSections.length > 0) {
          showToast("Please view all sections before completing the module.");
          return;
        }
      }

      setIsCompleting(true);

      const answeredQuestions = Array.from(questions.values()).filter(
        (question) => question.hasAnswered
      );

      const completedSections = Array.from(sections.values());

      await completeModuleMutation.mutateAsync({
        moduleId: ids.moduleId,
        sections: completedSections,
        questions: answeredQuestions,
      });

      const hasNextRoute = Boolean(
        (hasNextModule && nextModuleId) ||
          (hasNextUnit && nextUnitId && hasNextUnitModule && nextUnitModuleId)
      );

      router.push({
        pathname: "/course/[courseId]/module/[moduleId]/congratulations",
        params: {
          courseId: ids.courseId.toString(),
          unitId: ids.unitId.toString(),
          moduleId: ids.moduleId.toString(),
          nextModuleId:
            hasNextModule && nextModuleId ? nextModuleId.toString() : undefined,
          nextUnitId:
            hasNextUnit && nextUnitId ? nextUnitId.toString() : undefined,
          nextUnitModuleId:
            hasNextUnitModule && nextUnitModuleId
              ? nextUnitModuleId.toString()
              : undefined,
          hasNext: hasNextRoute.toString(),
        },
      });
    } catch (error) {
      showToast("Failed to save module progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  };

  const renderItem = useCallback(
    ({ item: section, index }: { item: Section; index: number }) => {
      // Create a key that changes when the question state changes
      const questionKey = isQuestionSection(section)
        ? JSON.stringify(moduleProgress.questions.get(section.content.id))
        : undefined;

      // Determine if this is just a question update
      const isQuestionUpdate =
        isQuestionSection(section) && questionKey !== undefined;

      return (
        <AnimatedSection
          index={index}
          key={`${section.id}-${questionKey}`}
          isQuestionUpdate={isQuestionUpdate}
        >
          <View>
            <SectionsList
              section={section}
              handleQuestionAnswer={handleQuestionAnswer}
              questionsState={moduleProgress.questions}
            />
          </View>
        </AnimatedSection>
      );
    },
    [handleQuestionAnswer, moduleProgress]
  );

  if (error) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.onSurface }}>{MESSAGES.ERROR}</Text>
      </View>
    );
  }

  if (
    isPending ||
    !currentModule ||
    !moduleProgress ||
    !currentModule?.sections
  ) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        moduleName={currentModule?.name ?? ""}
        progress={calculateProgress}
        colors={colors}
      />

      <FlashList
        data={sortedSections}
        renderItem={renderItem}
        estimatedItemSize={200}
        keyExtractor={(item) => `${item.id}-${item.position}`}
        contentContainerStyle={styles.flashListContainer}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={SECTION_VIEWABILITY_CONFIG}
        extraData={moduleProgress.questions}
        ListFooterComponent={() => (
          <View style={styles.endOfModule}>
            <Button
              title={MESSAGES.COMPLETE_BUTTON}
              style={{ backgroundColor: colors.inverseSurface }}
              textStyle={{ color: colors.inverseOnSurface }}
              onPress={handleModuleCompletion}
            />
          </View>
        )}
      />

      <ModuleFooter
        moduleName={currentModule?.name ?? ""}
        onNext={handleModuleCompletion}
        onTOC={() =>
          router.push({
            pathname: "/(protected)/course/[courseId]/module/[moduleId]/toc",
            params: {
              courseId: ids.courseId,
              unitId: ids.unitId,
              moduleId: ids.moduleId,
            },
          })
        }
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flashListContainer: {
    padding: 20,
    paddingVertical: 28,
  },
  endOfModule: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
