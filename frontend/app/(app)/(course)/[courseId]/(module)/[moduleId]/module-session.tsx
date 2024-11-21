import { useEffect, useMemo, useState, useCallback } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { ScrollView, View, Text } from "@/src/components/Themed";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import SectionRenderer from "@/src/features/course/components/SectionRenderer";
import { Module } from "@/src/types/modules";
import Button from "@/src/components/common/Button";
import useTheme from "@/src/hooks/useTheme";
import { useModules } from "@/src/hooks/useModules";
import { Card } from "react-native-paper";

interface QuestionState {
  id: number;
  hasAnswered: boolean;
  selectedOptionId: number | null;
  isCorrect?: boolean;
}

interface RouteParams {
  courseId: string;
  unitId: string;
  moduleId: string;
  userId: number;
  type: string;
  include: string;
}

export default function ModuleSession() {
  const { colors } = useTheme();
  const { courseId, unitId, moduleId, userId, type, include } =
    useLocalSearchParams<RouteParams | any>();

  // Parse and validate route params
  const parsedParams = useMemo(
    () => ({
      courseId: parseInt(courseId ?? "", 10),
      unitId: parseInt(unitId ?? "", 10),
      moduleId: parseInt(moduleId ?? "", 10),
      userId: parseInt(userId ?? "", 10),
      type: type ?? "full",
      include: include ?? "",
    }),
    [courseId, unitId, moduleId, type, include]
  );

  console.log("PARAAAAAAAAAMS", parsedParams);

  // Validate params early
  const isValidParams = useMemo(
    () =>
      !isNaN(parsedParams.courseId) &&
      !isNaN(parsedParams.unitId) &&
      !isNaN(parsedParams.moduleId),
    [parsedParams]
  );

  // Fetch module data
  const {
    module: { data: module, isPending, error },
  } = useModules({
    courseId: parsedParams.courseId,
    unitId: parsedParams.unitId,
    moduleId: parsedParams.moduleId,
    userId: parsedParams.userId,
    type: parsedParams.type,
    include: parsedParams.include,
  });

  // State management for questions
  const [questionsState, setQuestionsState] = useState<
    Map<number, QuestionState>
  >(new Map());

  // Memoized sections
  const sortedSections = useMemo(() => {
    if (!module?.sections) return [];
    return [...module.sections].sort((a, b) => a.position - b.position);
  }, [module?.sections]);

  // Initialize questions state
  useEffect(() => {
    if (!module?.sections) return;

    const questionsMap = new Map<number, QuestionState>();
    module.sections.forEach((section) => {
      if (section.type === "question") {
        const userAnswer = section.content.user_question_answer;
        questionsMap.set(section.content.question_id, {
          // Changed from content.id to content.question_id
          id: section.content.question_id, // Changed from content.id to content.question_id
          hasAnswered: !!userAnswer,
          selectedOptionId: userAnswer?.answer_id || null,
          isCorrect: userAnswer?.is_correct,
        });
      }
    });
    setQuestionsState(questionsMap);
  }, [module?.sections]);

  // Handle question answer selection
  const handleQuestionAnswer = useCallback(
    (questionId: number, selectedOptionId: number, isCorrect: boolean) => {
      setQuestionsState((prev) => {
        const next = new Map(prev);
        next.set(questionId, {
          id: questionId,
          hasAnswered: true,
          selectedOptionId,
          isCorrect,
        });
        return next;
      });

      // Here you could also make an API call to save the answer
      // saveAnswer(questionId, selectedOptionId);
    },
    []
  );

  // Calculate progress
  const progress = useMemo(() => {
    if (!questionsState.size) return 0;
    const answeredCount = Array.from(questionsState.values()).filter(
      (q) => q.hasAnswered
    ).length;
    return (answeredCount / questionsState.size) * 100;
  }, [questionsState]);

  const handleNextModule = useCallback(() => {
    // Check if all questions are answered
    const allAnswered = Array.from(questionsState.values()).every(
      (q) => q.hasAnswered
    );

    if (!allAnswered) {
      // You might want to show an alert or message here
      console.log("Please answer all questions before proceeding");
      return;
    }

    // Implement next module logic
    console.log("Next Module");
  }, [questionsState]);

  if (!isValidParams) {
    return <Text>Invalid params</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  if (isPending || !module) {
    return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          <Text style={styles.headerText}>{module.name}</Text>
          <View style={styles.progressContainer}>
            <View style={[styles.currentProgress, { width: `${progress}%` }]} />
            <View style={styles.progressBar} />
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ backgroundColor: colors.background }}>
        <View
          style={[
            styles.viewContainer,
            { backgroundColor: colors.viewBackground },
          ]}
        >
          {sortedSections.map((section) => (
            <SectionRenderer
              key={section.id + section.position}
              section={section}
              handleQuestionAnswer={handleQuestionAnswer}
              questionsState={questionsState}
            />
          ))}
          <View style={styles.endOfModule}>
            <Button
              title="Complete"
              style={{ backgroundColor: colors.buttonBackground }}
              textStyle={{ color: colors.buttonText }}
              onPress={handleNextModule}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.stickyFooter,
          { backgroundColor: colors.secondaryBackground },
        ]}
      >
        <View style={styles.stickyFooterInner}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("toc" as any)}>
            <Text>
              <Feather name="book-open" color={colors.icon} />
              {module.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextModule}>
            <Feather name="arrow-right" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flex: 1,
    position: "relative",
    height: 5,
  },
  container: {
    flex: 1,
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
  stickyFooter: {
    paddingTop: 40,
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  stickyFooterInner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    height: 40,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  footerContent: {
    marginTop: 10,
  },
  footerItem: {
    paddingVertical: 5,
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
    // backgroundColor: "#FFD700",
    backgroundColor: "#25A879",
    borderRadius: 5,
  },
  viewContainer: {
    flex: 1,
    padding: 20,
    paddingVertical: 28,
  },
  endOfModule: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "transparent",
  },
});
