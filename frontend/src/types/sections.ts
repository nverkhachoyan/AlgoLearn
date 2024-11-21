import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";

export interface Section extends BaseModel {
  module_id?: number;
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
  question_id: number;
  content: string;
  is_correct: boolean;
}

export type QuestionContent = {
  id: number;
  question: string;
  options: QuestionOption[];
};
