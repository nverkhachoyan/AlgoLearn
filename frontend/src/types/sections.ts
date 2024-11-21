import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";

export interface Section extends BaseModel {
  moduleId?: number;
  type: "text" | "video" | "question" | "code";
  position: number;
  content: any;
}

export type TextContent = {
  content: string;
};

export type VideoContent = {
  url: string;
};

export type CodeContent = {
  content: string;
};

export interface QuestionOption {
  id: number;
  question: string;
  questionId: number;
  content: string;
  isCorrect: boolean;
}

export type QuestionContent = {
  id: number;
  question: string;
  options: QuestionOption[];
};
