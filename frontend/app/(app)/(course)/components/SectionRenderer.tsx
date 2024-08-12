import React, { useState, useCallback } from "react";
import { Linking, Alert, StyleSheet, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { Image, ImageStyle } from "expo-image";
import LottieView from "lottie-react-native";
import Markdown from "react-native-markdown-display";
import YoutubePlayer from "./YoutubePlayer";
import CodeBlock from "./CodeBlock";
import { FontAwesome6 } from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";

export type QuestionState = {
  question_id: number;
  has_answered: boolean;
  selected_option_id?: number;
};

const SectionRenderer = ({
  section,
  handleQuestionAnswer,
  questionsState,
}: {
  section: any;
  handleQuestionAnswer: (question_id: number, selected_id: number) => void;
  questionsState: Map<number, QuestionState>;
}) => {
  const { colors } = useTheme();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const onStateChange = useCallback((state: any) => {
    if (state === "ended") {
      setVideoPlaying(false);
      Alert.alert("video has finished playing!");
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setVideoPlaying((prev) => !prev);
  }, []);

  const getIconColor = (
    optionId: number,
    questionState: QuestionState | undefined,
  ) => {
    if (questionState?.has_answered) {
      if (optionId === section.correct_option_id) {
        return "green";
      } else if (optionId === questionState.selected_option_id) {
        return "red";
      }
    }
    return colors.text;
  };

  const getOptionIcon = (
    optionId: number,
    questionState: QuestionState | undefined,
  ) => {
    if (questionState?.has_answered) {
      if (optionId === section.correct_option_id) {
        return "check-circle";
      } else if (optionId === questionState.selected_option_id) {
        return "times-circle";
      }
    }
    return "circle";
  };

  switch (section.type) {
    case "text":
      return (
        <Markdown
          key={section.position}
          rules={{
            code: () => null, // This will prevent Markdown from rendering code blocks
            image: (node) => {
              return (
                <Image
                  key={node.key}
                  source={{ uri: node.attributes.src }}
                  style={[
                    styles.section,
                    {
                      width: "100%",
                      height: 200,
                      // @ts-ignore-next-line
                      contentFit: "contain",
                      color: colors.text,
                    },
                  ]}
                />
              );
            },
          }}
          style={{
            body: { fontSize: 16, fontFamily: "OpenSauceOne-Regular" },
            heading1: { fontSize: 24, fontFamily: "OpenSauceOne-Bold" },
            heading2: { fontSize: 22, fontFamily: "OpenSauceOne-Bold" },
            heading3: {
              fontSize: 20,
              fontFamily: "OpenSauceOne-Bold",
            },
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
          {section.content}
        </Markdown>
      );
    case "image":
      return (
        <View key={section.position} style={[styles.section]}>
          <Image
            source={{ uri: section.url }}
            style={{ width: "100%", height: 200 }}
          />
          {section.description && <Text>{section.description}</Text>}
        </View>
      );
    case "lottie":
      return (
        <View
          key={section.position}
          style={[styles.section, { width: "100%" }]}
        >
          <LottieView
            source={section.animation}
            style={{ flex: 1, alignSelf: "center", width: 200, height: 200 }}
            autoPlay
            loop
          />
        </View>
      );
    case "question":
      const questionState = questionsState.get(section.question_id);
      return (
        <View
          key={section.position}
          style={[
            styles.section,
            styles.questionContainer,
            { backgroundColor: colors.questionCardBg },
          ]}
        >
          <Text style={[styles.question, { color: colors.text }]}>
            {section.question}
          </Text>
          {section.options.map((option: any) => (
            <TouchableOpacity
              key={option.id}
              style={[
                questionState?.selected_option_id === option.id
                  ? [
                      styles.questionOptionSelected,
                      {
                        opacity: 0.5,
                      },
                    ]
                  : styles.questionOption,
              ]}
              onPress={() =>
                handleQuestionAnswer(section.question_id, option.id)
              }
              disabled={questionState?.has_answered}
            >
              <FontAwesome6
                name={getOptionIcon(option.id, questionState)}
                style={[
                  styles.questionOptionIcon,
                  { color: getIconColor(option.id, questionState) },
                ]}
              />
              <Text style={{ color: colors.text }}> {option.content} </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    case "video":
      return (
        <View
          key={section.position}
          style={[
            styles.section,
            {
              height: 200,
              marginVertical: 10,
              borderRadius: 5,
              overflow: "hidden",
            },
          ]}
        >
          <YoutubePlayer videoId={section.url.split("v=")[1]} />
        </View>
      );
    case "code":
      return (
        <CodeBlock
          key={section.position}
          code={section.content.replace(/```javascript\n|```/g, "")}
        />
      );
    default:
      return null;
  }
};

export default SectionRenderer;

const styles = StyleSheet.create({
  section: {
    marginVertical: 20,
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
