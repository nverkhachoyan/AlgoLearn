import React, { useState, useCallback } from "react";
import { Linking, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/src/components/Themed";
import { Image } from "expo-image";
import Markdown from "react-native-markdown-display";
import YoutubePlayer from "./YoutubePlayer";
import CodeBlock from "./CodeBlock";
import useTheme from "@/src/hooks/useTheme";
import { Card, Checkbox } from "react-native-paper";
import { Section, QuestionContent } from "@/src/types/sections";

interface QuestionState {
  id: number;
  hasAnswered: boolean;
  selectedOptionId: number | null;
  isCorrect?: boolean;
}

interface SectionRendererProps {
  section: Section;
  handleQuestionAnswer: (
    questionId: number,
    selectedOptionId: number,
    isCorrect: boolean
  ) => void;
  questionsState: Map<number, QuestionState>;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({
  section,
  handleQuestionAnswer,
  questionsState,
}) => {
  const { colors } = useTheme();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setVideoPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const getOptionStyle = (
    questionId: number,
    optionId: number,
    isCorrect: boolean
  ) => {
    const questionState = questionsState.get(questionId);

    if (!questionState?.hasAnswered) {
      return styles.questionOption;
    }

    if (isCorrect) {
      return [
        styles.questionOption,
        { borderColor: "green", backgroundColor: "rgba(0, 255, 0, 0.1)" },
      ];
    }

    if (optionId === questionState.selectedOptionId) {
      return [
        styles.questionOption,
        { borderColor: "red", backgroundColor: "rgba(255, 0, 0, 0.1)" },
      ];
    }

    return styles.questionOption;
  };

  const getCheckboxStatus = (
    questionId: number,
    optionId: number
  ): "checked" | "unchecked" => {
    const questionState = questionsState.get(questionId);
    return questionState?.selectedOptionId === optionId
      ? "checked"
      : "unchecked";
  };

  const renderTextSection = (section: Section) => (
    <Card style={styles.section}>
      <Card.Content>
        <Markdown
          key={section.position}
          rules={{
            code: () => null,
            image: (node) => (
              <Image
                key={node.key}
                source={{ uri: node.attributes.src }}
                style={[
                  styles.section,
                  {
                    width: "100%",
                    height: 200,
                    //@ts-ignore
                    contentFit: "contain",
                    color: colors.text,
                  } as const,
                ]}
              />
            ),
          }}
          style={{
            body: { fontSize: 16, fontFamily: "OpenSauceOne-Regular" },
            heading1: { fontSize: 24, fontFamily: "OpenSauceOne-Bold" },
            heading2: { fontSize: 22, fontFamily: "OpenSauceOne-Bold" },
            heading3: { fontSize: 20, fontFamily: "OpenSauceOne-Bold" },
            ordered_list: { marginVertical: 15, color: colors.text },
            list_item: { marginVertical: 4 },
            text: { lineHeight: 24, color: colors.text },
            link: { color: "#434343", textDecorationLine: "underline" },
            code_inline: {
              color: colors.text,
              fontFamily: "OpenSauceOne-Bold",
              backgroundColor: colors.background,
            },
          }}
          onLinkPress={(url) => {
            Linking.openURL(url);
            return false;
          }}
        >
          {section.content.text}
        </Markdown>
      </Card.Content>
    </Card>
  );

  const renderQuestionSection = (section: Section) => {
    const questionContent = section.content as QuestionContent;
    const questionState = questionsState.get(questionContent.id);

    const handleOptionPress = (optionId: number, isCorrect: boolean) => {
      if (questionState?.hasAnswered) return; // Prevent changing answer after submission
      handleQuestionAnswer(questionContent.id, optionId, isCorrect);
    };

    return (
      <Card style={styles.section}>
        <Card.Content style={styles.questionContainer}>
          <Text style={[styles.question, { color: colors.text }]}>
            {questionContent.question}
          </Text>
          {questionContent.options.map((option) => {
            const isSelected = questionState?.selectedOptionId === option.id;

            return (
              <TouchableOpacity
                key={`${questionContent.id}-${option.id}`}
                onPress={() => handleOptionPress(option.id, option.is_correct)}
                disabled={questionState?.hasAnswered}
              >
                <View
                  style={getOptionStyle(
                    questionContent.id,
                    option.id,
                    option.is_correct
                  )}
                >
                  <Checkbox.Android
                    key={`checkbox-${questionContent.id}-${option.id}`}
                    status={isSelected ? "checked" : "unchecked"}
                    onPress={() =>
                      handleOptionPress(option.id, option.is_correct)
                    }
                    disabled={questionState?.hasAnswered}
                  />
                  <Text style={{ color: colors.text, flex: 1 }}>
                    {option.content}
                  </Text>
                  {questionState?.hasAnswered && (
                    <Text
                      style={{
                        color: option.is_correct
                          ? "green"
                          : option.id === questionState.selectedOptionId
                            ? "red"
                            : colors.text,
                        marginLeft: 8,
                      }}
                    >
                      {option.is_correct
                        ? "✓"
                        : option.id === questionState.selectedOptionId
                          ? "✗"
                          : ""}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          {questionState?.hasAnswered && (
            <Text
              style={{
                color: questionState.isCorrect ? "green" : "red",
                marginTop: 10,
                textAlign: "center",
              }}
            >
              {questionState.isCorrect
                ? "Correct! Well done!"
                : "Incorrect. Try reviewing the material."}
            </Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderVideoSection = (section: Section) => (
    <Card style={styles.section}>
      <Card.Title title="Video title" />
      <Card.Content>
        <View
          style={[
            {
              height: 199,
              marginVertical: 0,
              borderRadius: 5,
              overflow: "hidden",
            },
          ]}
        >
          <YoutubePlayer videoId={section.content.url.split("v=")[1]} />
        </View>
      </Card.Content>
    </Card>
  );

  const renderCodeSection = (section: Section) => (
    <CodeBlock
      code={section.content.content.replace(/```javascript\n|```/g, "")}
    />
  );

  switch (section.type) {
    case "text":
      return renderTextSection(section as Section);
    case "question":
      return renderQuestionSection(section as Section);
    case "video":
      return renderVideoSection(section as Section);
    case "code":
      return renderCodeSection(section as Section);
    default:
      return null;
  }
};

export default SectionRenderer;

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
