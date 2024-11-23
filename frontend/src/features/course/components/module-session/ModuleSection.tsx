import React, { useCallback, useEffect, useRef, memo } from "react";
import useTheme from "@/src/hooks/useTheme";
import {
  Section,
  isQuestionSection,
  isTextSection,
  isVideoSection,
  isCodeSection,
} from "@/src/features/module/types/sections";
import { QuestionSection } from "./QuestionSection";
import { TextSection } from "./TextSection";
import { CodeSection } from "./CodeSection";
import { VideoSection } from "./VideoSection";

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

const SectionRenderer: React.FC<SectionRendererProps> = memo(
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
      if (isTextSection(section)) {
        return (
          <TextSection
            content={section.content}
            position={section.position}
            colors={colors}
          />
        );
      }

      if (isQuestionSection(section)) {
        const questionState = questionsState.get(section.content.id);
        return (
          <QuestionSection
            content={section.content}
            questionState={questionState}
            onAnswer={(optionId, isCorrect) =>
              handleQuestionAnswer(section.content.id, optionId, isCorrect)
            }
            colors={colors}
          />
        );
      }

      if (isVideoSection(section)) {
        return <VideoSection content={section.content} />;
      }

      if (isCodeSection(section)) {
        return <CodeSection content={section.content} />;
      }

      console.warn(`Unknown section type: ${section.type}`);
      return null;
    }, [section, questionsState, handleQuestionAnswer, colors]);

    return renderSection();
  }
);

export default SectionRenderer;
