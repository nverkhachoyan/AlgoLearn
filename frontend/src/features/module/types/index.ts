import { BaseModel } from '@/src/types';
import { Section, QuestionProgress } from './sections';

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
  folderObjectKey?: string;
  imgKey?: string;
  mediaExt?: string;
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

export { isMarkdownSection, isQuestionSection } from './sections';
export type {
  Section,
  QuestionProgress,
  BatchModuleProgress,
  SectionViewState,
  QuestionOption,
  CodeContent,
} from './sections';
