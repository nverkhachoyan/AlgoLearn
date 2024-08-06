export type QuestionState = {
  question_id: number;
  has_answered: boolean;
  selected_option_id?: number;
};

export type SectionType =
  | "text"
  | "question"
  | "video"
  | "code"
  | "lottie"
  | "image";

export interface SectionBase {
  type: SectionType;
  position: number;
}

export interface TextSection extends SectionBase {
  type: "text";
  content: string;
}

export interface QuestionSection extends SectionBase {
  type: "question";
  question_id: number;
  question: string;
  options: { id: number; content: string }[];
  correct_option_id: number;
}

export interface VideoSection extends SectionBase {
  type: "video";
  url: string;
}

export interface CodeSection extends SectionBase {
  type: "code";
  content: string;
}

export interface LottieSection extends SectionBase {
  type: "lottie";
  animation: string;
}

export interface ImageSection extends SectionBase {
  type: "image";
  url: string;
  description?: string;
}

export type Section =
  | TextSection
  | QuestionSection
  | VideoSection
  | CodeSection
  | LottieSection
  | ImageSection;
