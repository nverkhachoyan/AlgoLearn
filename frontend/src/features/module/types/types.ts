import { BaseModel } from "@/src/types";

export interface Module extends BaseModel {
  moduleNumber: number;
  moduleUnitId: number;
  name: string;
  description: string;
  sections?: Section[];
}

export interface SectionProgress {
  sectionId: number;
  hasSeen: boolean;
  seenAt: string;
  startedAt: string;
  completedAt: string | null;
}

export interface QuestionProgress {
  questionId: number;
  hasAnswered: boolean;
  optionId: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface ModuleResponse {
  id: number;
  name: string;
  sections: Section[];
  nextModule?: {
    id: number;
    name: string;
  } | null;
  hasNextPage: boolean;
  nextCursor?: string;
}

export interface Section {
  id: number;
  position: number;
  type: string;
  content: any; // Replace 'any' with proper content type
}
