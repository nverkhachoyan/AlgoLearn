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
  isQuestionSection,
  SectionProgress,
  QuestionProgress,
} from "@/src/features/module/types";
import { ModuleHeader } from "@/src/features/course/components/module-session/ModuleHeader";
import { ModuleFooter } from "@/src/features/course/components/module-session/ModuleFooter";
import { useUpdateModuleProgress } from "@/src/hooks/useModules";
import { useModuleProgressInit } from "@/src/hooks/useModuleProgressInit";

interface RouteParams extends Record<string, string | undefined> {
  courseId: string;
  unitId: string;
  moduleId: string;
  userId: string;
  type?: string;
  filter?: string;
}

interface ModuleProgress {
  sections: Map<number, SectionProgress>;
  questions: Map<number, QuestionProgress>;
}

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

const SECTION_VIEWABILITY_CONFIG = {
  itemVisiblePercentThreshold: 50,
  minimumViewTime: 500,
} as const;

export default function ModuleSession() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<RouteParams | any>();
  const ids = useMemo(
    () => ({
      courseId: Number(params.courseId),
      unitId: Number(params.unitId),
      moduleId: Number(params.moduleId),
      userId: Number(params.userId),
    }),
    [params]
  );
  const {
    module: { data: module, isPending, error },
  } = useModules({
    courseId: ids.courseId,
    unitId: ids.unitId,
    moduleId: ids.moduleId,
    userId: ids.userId,
    type: params.type ?? "full",
    filter: params.filter ?? "",
  });

  const { moduleProgress, setModuleProgress } = useModuleProgressInit(module);
  const { mutation } = useUpdateModuleProgress(
    ids.courseId,
    ids.unitId,
    ids.moduleId,
    ids.userId
  );

  const sortedSections = useMemo(
    () =>
      module?.sections
        ?.slice()
        .sort((a: Section, b: Section) => a.position - b.position) ?? [],
    [module?.sections]
  );

  const viewabilityConfig = useMemo(
    () => ({
      ...SECTION_VIEWABILITY_CONFIG,
    }),
    []
  );

  const handleQuestionAnswer = useCallback(
    (questionId: number, optionId: number, isCorrect: boolean) => {
      setModuleProgress((prev) => ({
        ...prev,
        questions: new Map(prev.questions).set(questionId, {
          questionId: questionId,
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
      viewableItems.forEach((viewableItem) => {
        if (viewableItem.isViewable) {
          const section = viewableItem.item;
          setModuleProgress((prev) => {
            if (prev.sections.has(section.id)) return prev;

            const newSections = new Map(prev.sections);
            const now = new Date().toISOString();
            newSections.set(section.id, {
              sectionId: section.id,
              hasSeen: true,
              seenAt: now,
              startedAt: now,
              completedAt: section.type !== "question" ? now : null,
            });

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

    const completedSections = sortedSections.map((section: Section) => {
      const progress = sections.get(section.id);
      const hasSeen = Boolean(progress?.hasSeen);

      if (isQuestionSection(section)) {
        const questionId = section.content.id;
        const questionState = questions.get(questionId);
        const isComplete = hasSeen && Boolean(questionState?.hasAnswered);

        // If question is answered, update completedAt in section progress
        if (isComplete && !progress?.completedAt) {
          setModuleProgress((prev) => {
            const newSections = new Map(prev.sections);
            newSections.set(section.id, {
              ...progress!,
              completedAt: new Date().toISOString(),
            });
            return {
              ...prev,
              sections: newSections,
            };
          });
        }

        return {
          sectionId: section.id,
          isCompleted: isComplete,
          requiresQuestion: true,
          hasSeen,
          isAnswered: Boolean(questionState?.hasAnswered),
        };
      }

      return {
        sectionId: section.id,
        isCompleted: Boolean(progress?.completedAt),
        requiresQuestion: false,
        hasSeen,
        isAnswered: null,
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
  }, [moduleProgress, sortedSections, moduleProgress.questions]);

  const handleNextModule = useCallback(() => {
    calculateProgress;
    const { questions, sections } = moduleProgress;

    const sectionsArray: SectionProgress[] = Array.from(
      sections,
      ([_, section]) => ({ ...section })
    );

    const questionsArray: QuestionProgress[] = Array.from(
      questions,
      ([_, question]) => ({ ...question })
    );

    mutation.mutate({
      userId: ids.userId,
      moduleId: ids.moduleId,
      sections: sectionsArray,
      questions: questionsArray,
    });

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
