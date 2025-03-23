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
  fileUrl?: string;
  caption?: string;
  description?: string;
  width?: number;
  height?: number;
  altText?: string;
  fallbackURL?: string;
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;
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

export interface NewSection {
  id: string;
  type: "markdown" | "code" | "question" | "lottie";
  position: number;
  content: NewLottie | NewMarkdown | NewCode | NewVideo | NewQuestion;
}
