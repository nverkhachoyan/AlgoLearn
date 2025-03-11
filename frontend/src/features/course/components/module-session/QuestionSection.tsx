import React, { useCallback, memo } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import {
  Card,
  Checkbox,
  Text,
  Surface,
  Avatar,
  Badge,
  IconButton,
} from "react-native-paper";
import {
  Option,
  QuestionContent,
  QuestionProgress,
} from "@/src/features/module/types/sections";
import { usePoints } from "@/src/features/user/hooks/usePoints";

interface QuestionSectionProps {
  content: QuestionContent;
  questionState: QuestionProgress | undefined;
  onAnswer: (questionId: number, optionId: number, isCorrect: boolean) => void;
  colors: any;
}

export const QuestionSection = memo(
  ({ content, questionState, onAnswer, colors }: QuestionSectionProps) => {
    const { addPoints, pointsValues } = usePoints();

    const getOptionStyle = useCallback(
      (option: Option) => {
        const isSelected = option.id === questionState?.optionId;
        const showResult = questionState?.hasAnswered;

        const baseStyle = [
          styles.questionOption,
          isSelected && styles.selectedOption,
        ];

        if (showResult) {
          if (option.isCorrect) {
            return [...baseStyle, styles.correctOption];
          }
          if (isSelected) {
            return [...baseStyle, styles.incorrectOption];
          }
        }

        return baseStyle;
      },
      [questionState]
    );

    return (
      <Card
        style={[styles.section, { backgroundColor: colors.background }]}
        elevation={0}
        mode="elevated"
      >
        <Card.Content style={styles.questionContainer}>
          <View style={styles.questionHeader}>
            <View
              style={[
                styles.tagContainer,
                { backgroundColor: colors.primary + "10" },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.primary }]}>
                Quiz
              </Text>
            </View>

            {questionState?.hasAnswered && questionState?.isCorrect && (
              <View style={styles.badgeContainer}>
                <IconButton
                  icon="check"
                  iconColor={colors.background}
                  size={14}
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colors.primary },
                  ]}
                />
                <Text style={[styles.statusText, { color: colors.primary }]}>
                  Correct
                </Text>
              </View>
            )}
          </View>

          <Text
            style={[styles.question, { color: colors.onBackground }]}
            variant="titleLarge"
          >
            {content.question}
          </Text>

          <View style={styles.optionsContainer}>
            {content.options.map((option, index) => {
              const isSelected = option.id === questionState?.optionId;
              const showResult = questionState?.hasAnswered;
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D...

              return (
                <TouchableOpacity
                  key={`${content.id}-${option.id}`}
                  onPress={() =>
                    onAnswer(content.id, option.id, option.isCorrect)
                  }
                  style={styles.optionContainer}
                >
                  <Surface
                    style={[
                      getOptionStyle(option),
                      {
                        backgroundColor: isSelected
                          ? colors.secondaryContainer
                          : colors.surface,
                      },
                    ]}
                    elevation={isSelected ? 1 : 0}
                  >
                    <View style={styles.optionInner}>
                      <View
                        style={[
                          styles.optionLetterContainer,
                          {
                            backgroundColor: isSelected
                              ? colors.secondary
                              : colors.surfaceVariant,
                            borderColor: isSelected
                              ? colors.secondary
                              : colors.outline + "40",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionLetter,
                            {
                              color: isSelected
                                ? colors.onSecondary
                                : colors.onSurfaceVariant,
                            },
                          ]}
                        >
                          {optionLetter}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: isSelected
                              ? colors.onSecondaryContainer
                              : colors.onSurface,
                            fontWeight: isSelected ? "500" : "400",
                          },
                          showResult &&
                            !option.isCorrect &&
                            isSelected &&
                            styles.incorrectText,
                        ]}
                      >
                        {option.content}
                      </Text>

                      {showResult && (
                        <View style={styles.resultContainer}>
                          <IconButton
                            icon={
                              option.isCorrect
                                ? "check-circle-outline"
                                : isSelected
                                  ? "information-outline"
                                  : ""
                            }
                            iconColor={
                              option.isCorrect
                                ? colors.primary
                                : isSelected
                                  ? colors.onSurfaceVariant
                                  : "transparent"
                            }
                            size={20}
                            style={styles.resultIcon}
                          />
                        </View>
                      )}
                    </View>
                  </Surface>
                </TouchableOpacity>
              );
            })}
          </View>

          {questionState?.hasAnswered && (
            <Surface style={styles.resultFeedback} elevation={0}>
              <View
                style={[
                  styles.feedbackBar,
                  {
                    backgroundColor: questionState.isCorrect
                      ? colors.primary + "20"
                      : colors.surfaceVariant,
                  },
                ]}
              />
              <View style={styles.feedbackContent}>
                <IconButton
                  icon={
                    questionState.isCorrect
                      ? "lightbulb-outline"
                      : "information-outline"
                  }
                  iconColor={
                    questionState.isCorrect
                      ? colors.primary
                      : colors.onSurfaceVariant
                  }
                  size={24}
                  style={styles.feedbackIcon}
                />
                <View style={styles.feedbackTextContainer}>
                  <Text
                    style={[
                      styles.feedbackTitle,
                      {
                        color: questionState.isCorrect
                          ? colors.primary
                          : colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {questionState.isCorrect
                      ? "Great work!"
                      : "Let's review this"}
                  </Text>
                  <Text
                    style={[
                      styles.feedbackDescription,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {questionState.isCorrect
                      ? "You've selected the correct answer."
                      : "Review the correct answer highlighted above."}
                  </Text>
                </View>
              </View>
            </Surface>
          )}
        </Card.Content>
      </Card>
    );
  }
);

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  section: {
    marginVertical: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderColor: "rgba(0,0,0,0.06)",
  },
  questionContainer: {
    padding: 20,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "space-between",
  },
  tagContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    margin: 0,
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  question: {
    marginBottom: 24,
    fontSize: 20,
    fontWeight: "600",
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  questionOption: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingLeft: 4,
  },
  optionLetterContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedOption: {
    borderColor: "transparent",
  },
  correctOption: {
    borderColor: "rgba(0,0,0,0)",
    backgroundColor: "rgba(46, 204, 113, 0.1)",
  },
  incorrectOption: {
    borderColor: "rgba(0,0,0,0)",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  resultContainer: {
    marginLeft: "auto",
  },
  resultIcon: {
    margin: 0,
  },
  optionContainer: {
    width: "100%",
  },
  incorrectText: {
    color: "rgba(0, 0, 0, 0.7)",
  },
  resultFeedback: {
    marginTop: 24,
    borderRadius: 16,
    overflow: "hidden",
  },
  feedbackBar: {
    height: 4,
    width: "100%",
  },
  feedbackContent: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  feedbackIcon: {
    margin: 0,
    marginRight: 8,
  },
  feedbackTextContainer: {
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  feedbackDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
