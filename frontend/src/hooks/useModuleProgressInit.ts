import { Module } from "../features/module/types";
import { BatchModuleProgress } from "../features/module/types";
import { useState, useEffect } from "react";
import {
  SectionProgress,
  QuestionProgress,
  Section,
  isQuestionSection,
} from "../features/module/types";

interface ModuleProgress {
  sections: Map<number, SectionProgress>;
  questions: Map<number, QuestionProgress>;
}

export const useModuleProgressInit = (module: Module | undefined) => {
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress>({
    sections: new Map(),
    questions: new Map(),
  });

  useEffect(() => {
    if (!module?.sections) return;

    const sectionsMap = new Map<number, SectionProgress>();
    const questionsMap = new Map<number, QuestionProgress>();

    module.sections.forEach((section: Section) => {
      // Initialize section progress from backend data
      const { id, sectionProgress } = section;
      if (sectionProgress) {
        sectionsMap.set(id, {
          sectionId: id,
          hasSeen: Boolean(sectionProgress.seenAt),
          seenAt: sectionProgress.seenAt,
          startedAt: sectionProgress.startedAt,
          completedAt: sectionProgress.completedAt,
        });
      }

      // Initialize question progress if it's a question section
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

    setModuleProgress((prev) => ({
      ...prev,
      sections: sectionsMap,
      questions: questionsMap,
    }));
  }, [module?.sections]);

  return { moduleProgress, setModuleProgress };
};
