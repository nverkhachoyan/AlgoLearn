import React, { useCallback, memo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Checkbox, Text } from "react-native-paper";
import { QuestionContent, QuestionProgress } from "@/src/features/module/types";

interface QuestionSectionProps {
  content: QuestionContent;
  questionState: QuestionProgress | undefined;
  onAnswer: (questionId: number, optionId: number, isCorrect: boolean) => void;
  colors: any;
}

export const QuestionSection = memo(
  ({ content, questionState, onAnswer, colors }: QuestionSectionProps) => {
    const getOptionStyle = useCallback(
      (option: { id: number; isCorrect: boolean }) => {
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
      <Card style={[styles.section, { backgroundColor: colors.surface }]}>
        <Card.Content style={styles.questionContainer}>
          <Text style={[styles.question, { color: colors.onSurface }]}>
            {content.question}
          </Text>
          {content.options.map((option) => {
            const isSelected = option.id === questionState?.optionId;
            const showResult = questionState?.hasAnswered;

            return (
              <TouchableOpacity
                key={`${content.id}-${option.id}`}
                onPress={() =>
                  onAnswer(content.id, option.id, option.isCorrect)
                }
                style={styles.optionContainer}
              >
                <View style={getOptionStyle(option)}>
                  <Checkbox.Android
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() =>
                      onAnswer(content.id, option.id, option.isCorrect)
                    }
                  />
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.onSurface },
                      showResult &&
                        !option.isCorrect &&
                        isSelected &&
                        styles.incorrectText,
                    ]}
                  >
                    {option.content}
                  </Text>
                  {showResult && (
                    <Text
                      style={[
                        styles.resultIcon,
                        {
                          color: option.isCorrect
                            ? "green"
                            : isSelected
                              ? "red"
                              : colors.onSurface,
                        },
                      ]}
                    >
                      {option.isCorrect ? "✓" : isSelected ? "✗" : ""}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card.Content>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    return false;
  }
);

const styles = StyleSheet.create({
  section: {
    marginVertical: 10,
  },
  questionContainer: {
    padding: 10,
    borderRadius: 5,
  },
  question: {
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "500",
  },
  questionOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginVertical: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  selectedOption: {
    borderColor: "#666",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  correctOption: {
    borderColor: "green",
    backgroundColor: "rgba(0, 255, 0, 0.1)",
  },
  incorrectOption: {
    borderColor: "red",
    backgroundColor: "rgba(255, 0, 0, 0.1)",
  },
  optionText: {
    flex: 1,
    fontSize: 14,
  },
  resultIcon: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
  optionContainer: {
    marginVertical: 4,
  },
  incorrectText: {
    color: "rgba(255, 0, 0, 0.7)",
  },
});
