import { Module } from "../types";
import { BatchModuleProgress } from "../types";
import { useState, useEffect, useRef } from "react";
import {
  SectionProgress,
  QuestionProgress,
  Section,
  isQuestionSection,
} from "../types";

interface ModuleProgress {
  sections: Map<number, SectionProgress>;
  questions: Map<number, QuestionProgress>;
}

export const useModuleProgressInit = (module: Module | undefined) => {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({
    sections: new Map(),
    questions: new Map(),
  });

  // Use a ref to track if we've already initialized this module
  const initializedModuleId = useRef<number | null>(null);

  useEffect(() => {
    if (!module?.sections) return;

    if (
      initializedModuleId.current === module.id &&
      moduleProgress.sections.size > 0
    ) {
      return;
    }

    initializedModuleId.current = module.id;

    const sectionsMap = new Map<number, SectionProgress>();
    const questionsMap = new Map<number, QuestionProgress>();

    module.sections.forEach((section: Section) => {
      const { id, sectionProgress } = section;
      if (sectionProgress) {
        const isQuestionType = isQuestionSection(section);
        const questionAnswer = isQuestionType
          ? section.content.userQuestionAnswer
          : null;

        // For non-question sections, they're complete if they've been seen
        // For question sections, they're complete if they've been seen AND answered
        const isComplete = isQuestionType
          ? Boolean(sectionProgress.hasSeen && questionAnswer?.answeredAt)
          : Boolean(sectionProgress.hasSeen);

        // Use the latest timestamp available for completedAt
        const completedAt = isQuestionType
          ? isComplete
            ? questionAnswer?.answeredAt
            : null
          : isComplete
            ? sectionProgress.seenAt
            : null;

        sectionsMap.set(id, {
          sectionId: id,
          hasSeen: Boolean(sectionProgress.seenAt),
          seenAt: sectionProgress.seenAt,
          startedAt: sectionProgress.startedAt,
          completedAt: completedAt ?? null,
        });
      }

      if (isQuestionSection(section)) {
        if (!section.content.id) {
          console.warn(`Question section ${section.id} has no questionId`);
          return;
        }

        const userAnswer = section.content.userQuestionAnswer;
        questionsMap.set(section.content.id, {
          questionId: section.content.id,
          hasAnswered: Boolean(userAnswer?.optionId),
          optionId: userAnswer?.optionId ?? null,
          isCorrect: userAnswer?.isCorrect ?? null,
          answeredAt: userAnswer?.answeredAt ?? null,
        });
      }
    });

    setModuleProgress({
      sections: sectionsMap,
      questions: questionsMap,
    });
  }, [module?.sections, module?.id]);

  return { moduleProgress, setModuleProgress };
};
