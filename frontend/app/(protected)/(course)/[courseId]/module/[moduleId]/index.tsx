import { useEffect, useMemo, useState, useCallback } from "react";
import { StyleSheet, ViewToken, View } from "react-native";
import {
  ActivityIndicator,
  MD2Colors,
  Text,
  useTheme,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import ModuleSection from "@/src/features/course/components/module-session/ModuleSection";
import Button from "@/src/components/common/Button";
import { useModules } from "@/src/hooks/useModules";
import {
  QuestionProgress,
  Section,
  SectionProgress,
} from "@/src/features/module/types";
import { ModuleHeader } from "@/src/features/course/components/module-session/ModuleHeader";
import { ModuleFooter } from "@/src/features/course/components/module-session/ModuleFooter";
import { useUpdateModuleProgress } from "@/src/hooks/useModules";
import { useModuleProgressInit } from "@/src/hooks/useModuleProgressInit";
import { Filter, Type } from "@/src/features/module/api/types";

// Constants
const SECTION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
} as const;

const MESSAGES = {
  ERROR: "An error occurred while loading the module",
  MODULE_COMPLETE: "Module Complete! Moving to next module...",
  COURSE_COMPLETE: "Congratulations! You've completed the course!",
  COMPLETE_BUTTON: "Complete Module",
} as const;

interface RouteParams extends Record<string, string | undefined> {
  courseId: string;
  unitId: string;
  moduleId: string;
  userId: string;
  type?: string;
  filter?: string;
}

export default function ModuleSession() {
  const router = useRouter();
  const { colors } = useTheme();
  const params = useLocalSearchParams<RouteParams | any>();
  const [isCompleting, setIsCompleting] = useState(false);

  const ids = useMemo(
    () => ({
      courseId: Number(params.courseId),
      unitId: Number(params.unitId),
      moduleId: Number(params.moduleId),
      userId: Number(params.userId),
    }),
    [params]
  );

  console.log("ids", ids);

  const {
    modules: { data: module, hasNextPage, isPending, error },
  } = useModules({
    courseId: ids.courseId,
    unitId: ids.unitId,
    moduleId: ids.moduleId,
    userId: ids.userId,
    type: params.type ?? ("full" as Type | string),
    filter: params.filter ?? ("all" as Filter | string),
    includeNextModule: true, // Add this option to your useModules hook
  });

  const { moduleProgress, setModuleProgress } = useModuleProgressInit(module);
  const { mutation } = useUpdateModuleProgress(
    ids.courseId,
    ids.unitId,
    ids.moduleId,
    ids.userId
  );

  console.log("hasNextPage", hasNextPage);
  console.log("module", module);

  const sortedSections = useMemo(
    () =>
      module?.sections
        ?.slice()
        .sort((a: Section, b: Section) => a.position - b.position) ?? [],
    [module?.sections]
  );

  const handleQuestionAnswer = useCallback(
    (questionId: number, optionId: number, isCorrect: boolean) => {
      setModuleProgress((prev) => ({
        ...prev,
        questions: new Map(prev.questions).set(questionId, {
          questionId,
          hasAnswered: true,
          optionId,
          isCorrect,
          answeredAt: new Date().toISOString(),
        }),
      }));
    },
    []
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
    []
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

      return {
        sectionId: section.id,
        isCompleted: Boolean(progress?.completedAt),
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

  const handleModuleCompletion = useCallback(async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      const { questions, sections } = moduleProgress;

      await mutation.mutateAsync({
        userId: ids.userId,
        moduleId: ids.moduleId,
        sections: Array.from(sections, ([_, section]) => ({ ...section })),
        questions: Array.from(questions, ([_, question]) => ({ ...question })),
      });

      // Navigate to next module if available
      if (hasNextPage) {
        router.push({
          pathname: "/(protected)/(course)/[courseId]/module/[moduleId]",
          params: {
            courseId: ids.courseId,
            unitId: ids.unitId,
            moduleId: module?.id,
            userId: ids.userId,
            type: "full",
            filter: "learning",
          },
        });
      } else {
        // Handle course completion
        router.replace({
          pathname: "/(protected)/(course)/[courseId]",
          params: {
            courseId: ids.courseId,
            type: "summary",
            filter: "learning",
          },
        });
      }
    } catch (error) {
      console.error("Error completing module:", error);
      // Handle error (show toast/alert)
    } finally {
      setIsCompleting(false);
    }
  }, [moduleProgress, ids, router, mutation]);

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
    return (
      <View style={styles.centerContainer}>
        <Text>{MESSAGES.ERROR}</Text>
      </View>
    );
  }

  if (isPending || !module) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator animating size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModuleHeader
        moduleName={module.name}
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
        moduleName={module.name}
        onNext={handleModuleCompletion}
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
