export type DifficultyLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";
export type Status = "uninitiated" | "in_progress" | "completed" | "abandoned";

export interface BaseModel {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
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
  folderObjectKey?: string;
  imgKey?: string;
  mediaExt?: string;
  imgUrl?: string;
  draft: boolean;
  name: string;
  description: string;
  requirements: string;
  whatYouLearn: string;
  backgroundColor: string;
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
  folderObjectKey?: string;
  imgKey?: string;
  mediaExt?: string;
  imgUrl?: string;
  unitNumber: number;
  name: string;
  description: string;
  modules: Module[];
}

export interface Module extends BaseModel {
  folderObjectKey?: string;
  imgKey?: string;
  mediaExt?: string;
  imgUrl?: string;
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
  type: "markdown" | "code" | "question" | "video" | "lottie" | "image";
  position: number;
  content: SectionContent;
  progress?: SectionProgress;
}

export type SectionContent =
  | MarkdownContent
  | CodeContent
  | QuestionContent
  | VideoContent
  | LottieContent
  | ImageContent;

export interface MarkdownContent {
  objectKey?: string;
  mediaExt?: string;
  markdown: string;
}

export interface CodeContent {
  objectKey?: string;
  mediaExt?: string;
  mediaUrl?: string;
  code: string;
  language: string;
}

export interface VideoContent {
  objectKey?: string;
  mediaExt?: string;
  mediaUrl?: string;
}

export interface LottieContent {
  tempUrl: string;
  objectKey?: string;
  mediaExt?: string;
  mediaUrl?: string;
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

export interface QuestionContent {
  id: number;
  objectKey?: string;
  mediaExt?: string;
  mediaUrl?: string;
  type: "multiple_choice";
  options: QuestionOption[];
  question: string;
  userQuestionAnswer?: UserQuestionAnswer;
}

export interface ImageContent {
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
