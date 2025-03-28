import { Module } from "../types";
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
      const { id } = section;

      // Important: Check both progress and sectionProgress fields
      // The API returns 'progress', but our code may have been using 'sectionProgress'
      const sectionProgress = section.progress || section.sectionProgress;

      // Log the section progress for debugging
      if (process.env.NODE_ENV === "development") {
        console.log(`Section ${id} progress:`, {
          hasProgress: !!sectionProgress,
          hasSeen: sectionProgress?.hasSeen,
          source: section.progress
            ? "progress"
            : section.sectionProgress
              ? "sectionProgress"
              : "none",
        });
      }

      // Initialize each section with a default state even if no progress
      const defaultProgress: SectionProgress = {
        sectionId: id,
        hasSeen: false,
        seenAt: null,
        startedAt: null,
        completedAt: null,
      };

      // If we have progress data from the server, use that
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

        // IMPORTANT: If server data says hasSeen is true, always respect that
        const hasSeen = Boolean(sectionProgress.hasSeen);

        sectionsMap.set(id, {
          sectionId: id,
          hasSeen, // Use the server's hasSeen value
          seenAt: sectionProgress.seenAt || new Date().toISOString(),
          startedAt: sectionProgress.startedAt || new Date().toISOString(),
          completedAt: completedAt ?? null,
        });

        // Log the section that has been seen for debugging
        if (process.env.NODE_ENV === "development" && hasSeen) {
          console.log(
            `Section ${id} marked as SEEN from server data (hasSeen: ${hasSeen})`
          );
        }
      } else {
        // If no progress data, initialize with default state
        sectionsMap.set(id, defaultProgress);
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

  // Add a debug logging effect for development
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && module?.id) {
      console.log(
        `Module ${module.id} progress initialized with:`,
        `${moduleProgress.sections.size} sections,`,
        `${Array.from(moduleProgress.sections.values()).filter((s) => s.hasSeen).length} seen sections,`,
        `${moduleProgress.questions.size} questions`
      );
    }
  }, [moduleProgress.sections.size, moduleProgress.questions.size, module?.id]);

  return { moduleProgress, setModuleProgress };
};
