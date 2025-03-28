import { AnimationObject } from "lottie-react-native";
export interface MarkdownContent {
  markdown: string;
  objectKey?: string;
  mediaExt?: string;
}

export interface VideoContent {
  url: string;
  objectKey?: string;
  mediaExt?: string;
}

export type Option = {
  content: string;
  id: number;
  isCorrect: boolean;
};

export interface QuestionContent {
  id: number;
  question: string;
  type: string;
  options: Option[];
  userQuestionAnswer: {
    optionId: number | null;
    answeredAt: string;
    isCorrect: boolean;
  };
  objectKey?: string;
  mediaExt?: string;
}

export interface CodeContent {
  code: string;
  language: string;
  objectKey?: string;
  mediaExt?: string;
}

export interface ImageContent {
  url: string;
  width: number;
  height: number;
  headline: string;
  caption: string;
  footer: string;
  altText: string;
  source: string;
  objectKey?: string;
  mediaExt?: string;
}

export interface LottieContent {
  source: string | AnimationObject;
  caption: string;
  description: string;
  width: number;
  height: number;
  altText: string;
  fallbackUrl: string;
  autoplay: boolean;
  loop: boolean;
  speed: number;
  objectKey: string;
  mediaExt: string;
}

export type SectionProgress = {
  sectionId: number;
  seenAt: Date | string | null;
  hasSeen: boolean;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
};

export type QuestionProgress = {
  questionId: number;
  optionId: number | null;
  hasAnswered: boolean;
  isCorrect?: boolean | null;
  answeredAt: string;
};

export interface BatchModuleProgress {
  userId: number;
  moduleId: number;
  sections: SectionProgress[];
  questions: QuestionProgress[];
}

export interface Section {
  id: number;
  createdAt: string;
  updatedAt: string;
  type: "markdown" | "video" | "question" | "code" | "image" | "lottie";
  position: number;
  content:
    | VideoContent
    | QuestionContent
    | MarkdownContent
    | CodeContent
    | ImageContent
    | LottieContent;
  sectionProgress?: SectionProgress;
  progress?: SectionProgress;
}

export function isQuestionSection(
  section: Section
): section is Section & { content: QuestionContent } {
  return section.type === "question";
}

export function isVideoSection(
  section: Section
): section is Section & { content: VideoContent } {
  return section.type === "video";
}

export function isMarkdownSection(
  section: Section
): section is Section & { content: MarkdownContent } {
  return section.type === "markdown";
}

export function isCodeSection(
  section: Section
): section is Section & { content: CodeContent } {
  return section.type === "code";
}

export function isImageSection(
  section: Section
): section is Section & { content: ImageContent } {
  return section.type === "image";
}

export function isLotteSection(
  section: Section
): section is Section & { content: LottieContent } {
  return section.type === "lottie";
}

export interface QuestionOption {
  id: number;
  question: string;
  questionId: number;
  content: string;
  isCorrect: boolean;
}

export interface SectionViewState {
  sectionId: number;
  hasViewed: boolean;
  viewedAt?: Date;
}
