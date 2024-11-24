import React, { useCallback, useEffect, useRef, memo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/src/components/Themed";
import { Card, Checkbox } from "react-native-paper";
import { QuestionContent, QuestionProgress } from "@/src/features/module/types";

interface QuestionSectionProps {
  content: QuestionContent;
  questionState: QuestionProgress | undefined;
  onAnswer: (optionId: number, isCorrect: boolean) => void;
  colors: any;
}

export const QuestionSection = memo(
  ({ content, questionState, onAnswer, colors }: QuestionSectionProps) => {
    const getOptionStyle = useCallback(
      (optionId: number, isCorrect: boolean) => {
        if (!questionState?.hasAnswered) {
          return styles.questionOption;
        }

        if (isCorrect) {
          return [
            styles.questionOption,
            { borderColor: "green", backgroundColor: "rgba(0, 255, 0, 0.1)" },
          ];
        }

        if (optionId === questionState.optionId) {
          return [
            styles.questionOption,
            { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.1)" },
          ];
        }

        return styles.questionOption;
      },
      [questionState]
    );

    return (
      <Card style={styles.section}>
        <Card.Content style={styles.questionContainer}>
          <Text style={[styles.question, { color: colors.text }]}>
            {content.question}
          </Text>
          {content.options.map((option) => {
            const isSelected = questionState?.optionId === option.id;

            return (
              <TouchableOpacity
                key={`${content.id}-${option.id}`}
                onPress={() => onAnswer(option.id, option.isCorrect)}
              >
                <View style={getOptionStyle(option.id, option.isCorrect)}>
                  <Checkbox.Android
                    key={`checkbox-${content.id}-${option.id}`}
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() => onAnswer(option.id, option.isCorrect)}
                  />
                  <Text style={{ color: colors.text, flex: 1 }}>
                    {option.content}
                  </Text>
                  {questionState?.hasAnswered && (
                    <Text
                      style={{
                        color: option.isCorrect
                          ? "green"
                          : option.id === questionState.optionId
                            ? "red"
                            : colors.text,
                        marginLeft: 8,
                      }}
                    >
                      {option.isCorrect
                        ? "✓"
                        : option.id === questionState.optionId
                          ? "✗"
                          : ""}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </Card.Content>
      </Card>
    );
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
  questionOptionSelected: {
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
  questionOptionIcon: {
    fontSize: 14,
  },
});
