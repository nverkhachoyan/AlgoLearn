import React, {useState, useCallback} from "react";
import {Linking, Alert, StyleSheet, TouchableOpacity} from "react-native";
import {View, Text} from "@/components/Themed";
import {Image} from "expo-image";
import LottieView from "lottie-react-native";
import Markdown from "react-native-markdown-display";
import YoutubePlayer from "./YoutubePlayer";
import CodeBlock from "./CodeBlock";
import {FontAwesome6} from "@expo/vector-icons";
import useTheme from "@/hooks/useTheme";
import { Card, Checkbox} from 'react-native-paper';
import {Section, QuestionSection, TextSection, VideoSection, CodeSection} from "@/types/sections";

export interface QuestionState {
  question_id: number;
  has_answered: boolean;
  selected_option_id: number;
}

interface SectionRendererProps {
  section: Section;
  handleQuestionAnswer: (question_id: number, selected_id: number) => void;
  questionsState: Map<number, QuestionState>;
}

const SectionRenderer: React.FC<any> = ({section,handleQuestionAnswer,questionsState,}) => {
  const {colors} = useTheme();
  const [videoPlaying, setVideoPlaying] = useState(false);

  const onStateChange = useCallback((state: string) => {
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
    correctOptionId: number
  ) => {
    if (questionState?.has_answered) {
      if (optionId === correctOptionId) {
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
    correctOptionId: number
  ) => {
    if (questionState?.has_answered) {
      if (optionId === correctOptionId) {
        return "check-circle";
      } else if (optionId === questionState.selected_option_id) {
        return "times-circle";
      }
    }
    return "circle";
  };

  const renderTextSection = (section: TextSection) => (
    <Card style={styles.section} onLongPress={ () => console.log("long pressed")}>
    <Card.Content>
    <Markdown
      key={section.position}
      rules={{
        code: () => null,
        image: (node) => (
          <Image
            key={node.key}
            source={{uri: node.attributes.src}}
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
        body: {fontSize: 16, fontFamily: "OpenSauceOne-Regular"},
        heading1: {fontSize: 24, fontFamily: "OpenSauceOne-Bold"},
        heading2: {fontSize: 22, fontFamily: "OpenSauceOne-Bold"},
        heading3: {fontSize: 20, fontFamily: "OpenSauceOne-Bold"},
        ordered_list: {marginVertical: 15, color: colors.text},
        list_item: {marginVertical: 4},
        text: {lineHeight: 24, color: colors.text},
        link: {color: "#434343", textDecorationLine: "underline"},
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
    </Card.Content>
    </Card>
  );

  const renderQuestionSection = (section: QuestionSection) => {
    // const questionState = questionsState.get(section.question_id);

    return (
    <Card style={styles.section}>
      <Card.Content style={[styles.questionContainer]}>
        <Text style={[styles.question, {color: colors.text}]}>
          {section.question.question}
        </Text>
        {section.question.options.map((option, idx) => (
          <View style={styles.questionOption}>
            <Checkbox.Android  status="unchecked" />
            <Text style={{color: colors.text}}>{option.content}</Text>
          </View>
        ))}
      </Card.Content>
      </Card>
    );
  };

  const renderVideoSection = (section: VideoSection) => (
    <Card style={styles.section} onLongPress={() => console.log("long pressed video")}>
      <Card.Title title="Video title"/>
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
          <YoutubePlayer videoId={section.url.split("v=")[1]}/>
        </View>
      </Card.Content>
    </Card>
  );

  const renderCodeSection = (section: CodeSection) => (
    <CodeBlock code={section.content.replace(/```javascript\n|```/g, "")}/>
  );

  switch (section.type) {
    case "text":
      return renderTextSection(section as TextSection);
    case "question":
      return renderQuestionSection(section as QuestionSection);
    case "video":
      return renderVideoSection(section as VideoSection);
    case "code":
      return renderCodeSection(section as CodeSection);
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
