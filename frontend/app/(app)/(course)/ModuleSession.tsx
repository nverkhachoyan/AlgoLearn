import { useEffect, useMemo, useState, useCallback } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { ActivityIndicator, MD2Colors } from "react-native-paper";
import { ScrollView, View, Text } from "@/components/Themed";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import SectionRenderer from "./components/SectionRenderer";
import { Module } from "@/types/modules";
import Button from "@/components/common/Button";
import useTheme from "@/hooks/useTheme";
import { useModules } from "@/hooks/useModules";
import { Card } from "react-native-paper";
//import ErrorScreen from "@/components/ErrorScreen";
//import LoadingScreen from "@/components/LoadingScreen";

interface RouteParams {
  courseId: string;
  unitId: string;
  moduleId: string;
}

export default function ModuleSession() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<RouteParams | any>();

  // Parse and validate route params
  const parsedParams = useMemo(
    () => ({
      courseId: parseInt(params.courseId ?? "", 10),
      unitId: parseInt(params.unitId ?? "", 10),
      moduleId: parseInt(params.moduleId ?? "", 10),
    }),
    [params]
  );

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
  } = useModules(
    parsedParams.courseId,
    parsedParams.unitId,
    parsedParams.moduleId
  );

  // State management for questions
  const [questionsState, setQuestionsState] = useState<Map<number, any>>(
    new Map()
  );

  // Memoized sections
  const sortedSections = useMemo(() => {
    if (!module?.sections) return [];
    return [...module.sections].sort((a, b) => a.position - b.position);
  }, [module?.sections]);

  //   Initialize questions state
  //  useEffect(() => {
  //    if (!module?.sections) return;

  //    const questionsMap = new Map<number, QuestionState>();
  //    module.sections.forEach((section) => {
  //      if (section.type === "question") {
  //        questionsMap.set(section.question_id, {
  //          question_id: section.question_id,
  //          has_answered: false,
  //          selected_option_id: 0,
  //        });
  //      }
  //    });
  //    setQuestionsState(questionsMap);
  //  }, [module?.sections]);

  // Handlers
  //  const handleQuestionAnswer = useCallback((
  //    question_id: number,
  //    selected_id: number
  //  ) => {
  //    setQuestionsState((prev) => {
  //      const next = new Map(prev);
  //      const question = next.get(question_id);
  //      if (question) {
  //        next.set(question_id, {
  //          ...question,
  //          has_answered: true,
  //          selected_option_id: selected_id,
  //        });
  //      }
  //      return next;
  //    });
  //  }, []);

  const handleNextModule = useCallback(() => {
    // Implement next module logic
    console.log("Next Module");
  }, []);

  // Error and loading states
  if (!isValidParams) {
    return <Text>Invalid params</Text>;
  }

  if (error) {
    return <Text>Error{error.message}</Text>;
  }

  if (isPending || !module) {
    return <ActivityIndicator animating={true} color={MD2Colors.red800} />;
  }

  return (
    <View style={styles.container}>
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
            <View style={[styles.currentProgress, { width: `${5}%` }]} />
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
            <Text>Section</Text>
            // <SectionRenderer
            //   key={section.position}
            //   section={section}
            //   handleQuestionAnswer={() => console.log("handled answer")}
            //   questionsState={null}
            // />
          ))}
          <View style={styles.endOfModule}>
            <Button
              title="Next Module"
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
          <TouchableOpacity onPress={() => router.push("/SessionTOC")}>
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
    backgroundColor: "transparent",
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
