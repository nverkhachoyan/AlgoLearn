import { BaseModel } from "@/src/types";
import { Section, QuestionProgress } from "./sections";

export interface Module extends BaseModel {
  moduleNumber: number;
  moduleUnitId: number;
  name: string;
  description: string;
  progress?: number;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  lastAccessed?: string;
  sections?: Section[];
}

export interface ModuleProgress {
  sections: Map<number, SectionProgress>;
  questions: Map<number, QuestionProgress>;
}

export interface SectionProgress {
  sectionId: number;
  hasSeen: boolean;
  seenAt: string | Date | null;
  startedAt: string | Date | null;
  completedAt: string | Date | null;
}

export {
  Section,
  QuestionProgress,
  BatchModuleProgress,
  isQuestionSection,
  SectionViewState,
  QuestionOption,
  isMarkdownSection,
  CodeContent,
} from "./sections";
