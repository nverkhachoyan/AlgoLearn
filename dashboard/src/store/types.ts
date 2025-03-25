// Service layer types, different from actual tables
export interface UserPreferences {
  theme: "light" | "dark";
  lang: string;
  timezone: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "admin" | "user";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string;
  cpus: number;
  preferences: UserPreferences;
  profilePictureUrl?: string;
}

export interface NewLottie {
  file?: File | null;
  tempUrl: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  altText?: string;
  fallbackURL?: string;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
  objectKey?: string;
  mediaExt?: string;
}

export interface NewMarkdown {
  markdown: string;
}

export interface NewCode {
  code: string;
  language: string;
}

export interface NewVideo {
  mediaUrl?: string;
}

export interface NewQuestion {
  id: number;
  fileUrl?: string;
  type: "multiple_choice";
  options: QuestionOption[];
  question: string;
}

export interface QuestionOption {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface NewImage {
  file?: File | null;
  url: string;
  width: number;
  height: number;
  headline: string;
  caption: string;
  altText: string;
  source: string;
  objectKey?: string;
  mediaExt?: string;
}

export interface NewSection {
  id: number;
  type: "markdown" | "code" | "question" | "lottie" | "image";
  position: number;
  content:
    | NewLottie
    | NewMarkdown
    | NewCode
    | NewVideo
    | NewQuestion
    | NewImage;
}

export const isNewLottie = (
  section: NewSection
): section is NewSection & { content: NewLottie } => {
  return section.type === "lottie";
};

export const isNewMarkdown = (
  section: NewSection
): section is NewSection & { content: NewMarkdown } => {
  return section.type === "markdown";
};

export const isNewQuestion = (
  section: NewSection
): section is NewSection & { content: NewQuestion } => {
  return section.type === "question";
};

export const isNewCode = (
  section: NewSection
): section is NewSection & { content: NewCode } => {
  return section.type === "code";
};

export const isNewImage = (
  section: NewSection
): section is NewSection & { content: NewImage } => {
  return section.type === "image";
};
