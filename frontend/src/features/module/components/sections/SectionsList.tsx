import React, { useCallback, useEffect, useRef, memo } from "react";
import { useTheme } from "react-native-paper";
import {
  Section,
  isQuestionSection,
  isVideoSection,
  isCodeSection,
  isMarkdownSection,
  isLotteSection,
} from "@/src/features/module/types/sections";
import { QuestionSection } from "./QuestionSection";
import { MarkdownSection } from "./MarkdownSection";
import { CodeSection } from "./CodeSection";
import { VideoSection } from "./VideoSection";
import { QuestionProgress } from "@/src/features/module/types/sections";
import { LottieSection } from "./LottieSection";

interface SectionRendererProps {
  section: Section;
  handleQuestionAnswer: (
    questionId: number,
    selectedOptionId: number | null,
    isCorrect: boolean | null
  ) => void;
  questionsState: Map<number, QuestionProgress>;
}

const SectionsList: React.FC<SectionRendererProps> = memo(
  ({ section, handleQuestionAnswer, questionsState }) => {
    const { colors } = useTheme();
    const viewableRef = useRef(false);

    useEffect(() => {
      if (!viewableRef.current) {
        const timer = setTimeout(() => {
          viewableRef.current = true;
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [section.id]);

    const renderSection = useCallback(() => {
      if (isLotteSection(section)) {
        return (
          <LottieSection
            content={section.content}
            position={section.position}
            colors={colors}
          />
        );
      }

      if (isMarkdownSection(section)) {
        return (
          <MarkdownSection
            content={section.content}
            position={section.position}
            colors={colors}
          />
        );
      }

      if (isQuestionSection(section)) {
        const questionId = section.content.id;
        const questionState = questionsState.get(questionId);

        return (
          <QuestionSection
            content={section.content}
            questionState={questionState}
            onAnswer={handleQuestionAnswer}
            colors={colors}
          />
        );
      }

      if (isVideoSection(section)) {
        return <VideoSection content={section.content} colors={colors} />;
      }

      if (isCodeSection(section)) {
        return <CodeSection content={section.content} colors={colors} />;
      }

      console.warn(`Unknown section type: ${section.type}`);
      return null;
    }, [section, questionsState, handleQuestionAnswer, colors]);

    return renderSection();
  },
  (prevProps, nextProps) => {
    if (prevProps.section.id !== nextProps.section.id) return false;

    if (
      isQuestionSection(prevProps.section) &&
      isQuestionSection(nextProps.section)
    ) {
      const prevState = prevProps.questionsState.get(
        prevProps.section.content.id
      );
      const nextState = nextProps.questionsState.get(
        nextProps.section.content.id
      );
      return JSON.stringify(prevState) === JSON.stringify(nextState);
    }

    return false;
  }
);

export default SectionsList;
