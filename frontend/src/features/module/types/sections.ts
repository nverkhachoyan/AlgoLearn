export interface TextContent {
  text: string;
}

export interface MarkdownContent {
  markdown: string;
}

export interface VideoContent {
  url: string;
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
  type: "text" | "video" | "question" | "code" | "markdown";
  position: number;
  content: TextContent | VideoContent | QuestionContent | MarkdownContent;
  sectionProgress?: SectionProgress;
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

export function isTextSection(
  section: Section
): section is Section & { content: TextContent } {
  return section.type === "text";
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

export interface SectionViewState {
  sectionId: number;
  hasViewed: boolean;
  viewedAt?: Date;
}
