import { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, FlatList, ViewToken } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { View, Text } from "@/src/components/Themed";
import { useLocalSearchParams } from "expo-router";
import ModuleSection from "@/src/features/course/components/module-session/ModuleSection";
import { Section } from "@/src/features/module/types";
import Button from "@/src/components/common/Button";
import useTheme from "@/src/hooks/useTheme";
import { useModules } from "@/src/hooks/useModules";
import {
  SectionViewState,
  QuestionState,
  isQuestionSection,
} from "@/src/features/module/types";
import { ModuleHeader } from "@/src/features/course/components/module-session/ModuleHeader";
import { ModuleFooter } from "@/src/features/course/components/module-session/ModuleFooter";

interface RouteParams extends Record<string, string | undefined> {
  courseId: string;
  unitId: string;
  moduleId: string;
  userId: string;
  type?: string;
  filter?: string;
}

interface ModuleProgress {
  sections: Map<number, SectionViewState>;
  questions: Map<number, QuestionState>;
}

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

const SECTION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
} as const;

export default function ModuleSession() {
  const { colors } = useTheme();
  const { courseId, unitId, moduleId, userId, type, filter } =
    useLocalSearchParams<RouteParams | any>();
  const {
    module: { data: module, isPending, error },
  } = useModules({
    courseId: Number(courseId),
    unitId: Number(unitId),
    moduleId: Number(moduleId),
    userId: Number(userId),
    type: type ?? "full",
    filter: filter ?? "",
  });
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({
    sections: new Map(),
    questions: new Map(),
  });

  const sortedSections = useMemo(() => {
    if (!module?.sections) return [];
    return [...module.sections].sort((a, b) => a.position - b.position);
  }, [module?.sections]);

  useEffect(() => {
    if (!module?.sections) return;

    const questionsMap = new Map<number, QuestionState>();
    module.sections.forEach((section: Section) => {
      if (isQuestionSection(section)) {
        if (!section.content.id) {
          console.warn(`Question section ${section.id} has no questionId`);
          return;
        }

        const userAnswer = section.content.userQuestionAnswer;
        questionsMap.set(section.content.id, {
          id: section.content.id,
          hasAnswered: !!userAnswer.answerId,
          selectedOptionId: userAnswer?.answerId || null,
          isCorrect: userAnswer?.isCorrect,
        });
      }
    });

    setModuleProgress((prev) => ({
      ...prev,
      questions: questionsMap,
    }));
  }, [module?.sections]);

  console.log("moduleProgress: ", moduleProgress);

  const viewabilityConfig = useMemo(
    () => ({
      ...SECTION_VIEWABILITY_CONFIG,
    }),
    []
  );

  const handleQuestionAnswer = useCallback(
    (questionId: number, selectedOptionId: number, isCorrect: boolean) => {
      setModuleProgress((prev) => ({
        ...prev,
        questions: new Map(prev.questions).set(questionId, {
          id: questionId,
          hasAnswered: true,
          selectedOptionId,
          isCorrect,
        }),
      }));
      // API call to save the answer
    },
    []
  );

  const handleViewableItemsChanged = useCallback(
    ({
      viewableItems,
    }: {
      viewableItems: Array<ViewToken & { item: Section }>;
    }) => {
      viewableItems.forEach((viewableItem) => {
        if (viewableItem.isViewable) {
          const section = viewableItem.item;
          setModuleProgress((prev) => {
            if (prev.sections.has(section.id)) return prev;

            const newSections = new Map(prev.sections);
            newSections.set(section.id, {
              sectionId: section.id,
              hasViewed: true,
              viewedAt: new Date(),
            });

            console.log("Section has been viewed: ID ", section.id);
            // API call here

            return {
              ...prev,
              sections: newSections,
            };
          });
        }
      });
    },
    []
  );

  const calculateProgress = useMemo<Progress>(() => {
    const { sections, questions } = moduleProgress;
    const totalSections = sortedSections.length;

    // Calculate which sections are truly complete
    const completedSections = sortedSections.map((section) => {
      const isViewed = sections.has(section.id);

      if (section.type === "question") {
        const questionId = section.content.id;
        const questionState = questions.get(questionId);
        // Important: only consider complete if BOTH viewed AND answered
        const isComplete = isViewed && Boolean(questionState?.hasAnswered);

        return {
          sectionId: section.id,
          isCompleted: isComplete,
          requiresQuestion: true,
          isViewed,
          isAnswered: Boolean(questionState?.hasAnswered),
        };
      }

      // Non-question sections only need to be viewed
      return {
        sectionId: section.id,
        isCompleted: isViewed,
        requiresQuestion: false,
        isViewed,
        isAnswered: null,
      };
    });

    // Count only truly completed sections
    const completedCount = completedSections.filter(
      (s) => s.isCompleted
    ).length;

    console.log("completedCount", completedCount);

    // Calculate total progress based on completed sections
    const totalProgress =
      totalSections > 0 ? (completedCount / totalSections) * 100 : 0;

    // Get question stats
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
  }, [moduleProgress, sortedSections, moduleProgress.questions]);

  const handleNextModule = useCallback(() => {
    const { questions } = calculateProgress;

    if (questions.completed < questions.total) {
      console.log("Please answer all questions before proceeding");
      return;
    }

    console.log("Next Module");
  }, [calculateProgress]);

  const renderItem = useCallback(
    ({ item: section }: { item: Section }) => (
      <ModuleSection
        section={section}
        handleQuestionAnswer={handleQuestionAnswer}
        questionsState={moduleProgress.questions}
      />
    ),
    [handleQuestionAnswer, moduleProgress.questions]
  );

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (isPending || !module) {
    return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        moduleName={module.name}
        progress={calculateProgress}
        colors={colors}
      />
      <FlatList
        data={sortedSections}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.id}-${item.position}`}
        contentContainerStyle={[
          styles.flatListContainer,
          { backgroundColor: colors.viewBackground },
        ]}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        showsVerticalScrollIndicator={true}
        style={{ flex: 1 }}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        ListFooterComponent={() => (
          <View style={styles.endOfModule}>
            <Button
              title="Complete"
              style={{ backgroundColor: colors.buttonBackground }}
              textStyle={{ color: colors.buttonText }}
              onPress={handleNextModule}
            />
          </View>
        )}
      />
      <ModuleFooter
        moduleName={module.name}
        onNext={handleNextModule}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    padding: 20,
    paddingVertical: 28,
    flexGrow: 1,
  },
  endOfModule: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
