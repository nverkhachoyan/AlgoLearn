export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
export type Status = "uninitiated" | "in_progress" | "completed" | "abandoned";

export interface BaseModel {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Author {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Course extends BaseModel {
  draft: boolean;
  name: string;
  description: string;
  requirements: string;
  whatYouLearn: string;
  backgroundColor: string;
  iconUrl: string;
  duration: number;
  difficultyLevel: DifficultyLevel;
  authors: Author[];
  tags: Tag[];
  rating: number;
  currentUnit?: Unit;
  currentModule?: Module;
  progress: number;
  units: Unit[];
}

export interface Unit extends BaseModel {
  unitNumber: number;
  name: string;
  description: string;
  modules: Module[];
}

export interface Module extends BaseModel {
  moduleNumber: number;
  name: string;
  description: string;
  progress: number;
  status: Status;
  startedAt: string;
  completedAt?: string;
  lastAccessed: string;
  currentSectionNumber?: number;
  sections: Section[];
}

export interface Section extends BaseModel {
  type: "markdown" | "code" | "question";
  position: number;
  content: MarkdownContent | CodeContent | QuestionContent;
  progress?: SectionProgress;
}

export interface MarkdownContent {
  markdown: string;
}

export interface CodeContent {
  code: string;
  language: string;
}

export interface QuestionContent {
  id: number;
  type: "multiple_choice";
  options: QuestionOption[];
  question: string;
  userQuestionAnswer?: UserQuestionAnswer;
}

export interface QuestionOption {
  id: number;
  content: string;
  isCorrect: boolean;
}

export interface UserQuestionAnswer {
  optionId: number;
  progress: number;
  isCorrect: boolean;
  answeredAt: string;
}

export interface SectionProgress {
  sectionId: number;
  seenAt?: string;
  hasSeen: boolean;
  startedAt?: string;
  completedAt?: string;
  progress: number;
}

export interface UserPreferences {
  theme: "dark" | "light";
  lang: string;
  timezone: string;
}

export interface User extends BaseModel {
  username: string;
  email: string;
  role: string;
  lastLoginAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  cpus: number;
  preferences: UserPreferences;
}
