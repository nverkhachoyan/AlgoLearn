export interface TextContent {
  text: string;
}

export interface VideoContent {
  url: string;
}

export interface QuestionContent {
  id: number;
  question: string;
  type: string;
  options: Array<{
    content: string;
    id: number;
    isCorrect: boolean;
  }>;
  userQuestionAnswer: {
    answerId: number | null;
    answeredAt: string;
    isCorrect: boolean;
  };
}

export interface Section {
  id: number;
  createdAt: string;
  updatedAt: string;
  type: "text" | "video" | "question" | "code";
  position: number;
  content: TextContent | VideoContent | QuestionContent;
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

export interface QuestionState {
  id: number;
  hasAnswered: boolean;
  selectedOptionId: number | null;
  isCorrect?: boolean;
}
