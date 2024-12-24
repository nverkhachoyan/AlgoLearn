import { useMemo, useState, useCallback } from "react";
import { StyleSheet, ViewToken, View } from "react-native";
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

const SECTION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
} as const;

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
  const ids = useMemo(
    () => ({
      courseId: Number(params.courseId),
      unitId: Number(params.unitId),
      moduleId: Number(params.moduleId),
    }),
    [params]
  );
  const {
    currentModule: modulePayload,
    hasNextModule,
    completeModuleMutation,
    isPending,
    error,
  } = useModuleProgress({
    courseId: ids.courseId,
    unitId: ids.unitId,
    moduleId: ids.moduleId,
  });
  const { moduleProgress, setModuleProgress } = useModuleProgressInit(
    modulePayload?.module
  );
  const sortedSections: Section[] = useMemo(
    () =>
      modulePayload?.module?.sections
        ?.slice()
        .sort((a: any, b: any) => a.position - b.position) ?? [],
    [modulePayload?.module?.sections]
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

    console.log(
      "[Progress Debug] Sections Map:",
      Array.from(sections.entries())
    );
    console.log(
      "[Progress Debug] Questions Map:",
      Array.from(questions.entries())
    );

    const completedSections = sortedSections.map((section: any) => {
      const progress = sections.get(section.id);
      const hasSeen = Boolean(progress?.hasSeen);

      if (section.type === "question") {
        const questionState = questions.get(section.content.id);
        const isComplete = hasSeen && Boolean(questionState?.hasAnswered);

        console.log("[Progress Debug] Question Section:", {
          sectionId: section.id,
          questionId: section.content.id,
          hasSeen,
          hasAnswered: Boolean(questionState?.hasAnswered),
          isComplete,
        });

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

      console.log("[Progress Debug] Regular Section:", {
        sectionId: section.id,
        hasSeen,
        isComplete,
      });

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

    console.log("[Progress Debug] Completion Stats:", {
      completedCount,
      totalSections,
      completedSections: completedSections.map((s) => ({
        id: s.sectionId,
        completed: s.isCompleted,
      })),
    });

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

      if (hasNextModule && modulePayload?.nextModuleId) {
        router.replace({
          pathname: "/(protected)/course/[courseId]/module/[moduleId]",
          params: {
            courseId: ids.courseId,
            unitId: ids.unitId,
            moduleId: modulePayload.nextModuleId,
          },
        });
      } else {
        router.replace({
          pathname: "/(protected)/course/[courseId]",
          params: {
            courseId: ids.courseId,
          },
        });
      }
    } catch (error) {
      showToast("Failed to save module progress. Please try again.");
    } finally {
      setIsCompleting(false);
    }
  }, [
    moduleProgress,
    ids,
    router,
    completeModuleMutation,
    hasNextModule,
    modulePayload?.nextModuleId,
    showToast,
    sortedSections.length,
  ]);

  const renderItem = useCallback(
    ({ item: section }: { item: Section }) => {
      // Create a key that changes when the question state changes
      const questionKey = isQuestionSection(section)
        ? JSON.stringify(moduleProgress.questions.get(section.content.id))
        : undefined;

      return (
        <View key={`${section.id}-${questionKey}`}>
          <SectionsList
            section={section}
            handleQuestionAnswer={handleQuestionAnswer}
            questionsState={moduleProgress.questions}
          />
        </View>
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
    !modulePayload ||
    !moduleProgress ||
    !modulePayload?.module?.sections
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
        moduleName={modulePayload?.module?.name ?? ""}
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
        moduleName={modulePayload?.module?.name ?? ""}
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
