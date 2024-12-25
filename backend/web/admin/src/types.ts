import { RaRecord } from "react-admin";

export interface Author {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  title: string;
  content: string;
  type: "text" | "video" | "quiz";
  videoUrl?: string;
  questions?: Question[];
}

export interface Module extends RaRecord {
  id: number;
  createdAt: string;
  updatedAt: string;
  moduleNumber: number;
  name: string;
  description: string;
  progress: number;
  status: string;
  startedAt: string;
  completedAt: string;
  lastAccessed: string;
  sections: Section[] | null;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface Unit extends RaRecord {
  id: number;
  createdAt: string;
  updatedAt: string;
  unitNumber: number;
  name: string;
  description: string;
  modules: Module[] | null;
}

export interface Course extends RaRecord {
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  requirements: string;
  whatYouLearn: string;
  backgroundColor: string;
  iconUrl: string;
  duration: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  authors: Author[];
  tags: Tag[];
  rating: number;
  currentUnit: number | null;
  currentModule: number | null;
  progress: number;
  units: Unit[] | null;
}

export interface PaginationInfo {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  message: string;
  payload: {
    items: T[];
    pagination: PaginationInfo;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  payload: T;
}

export interface ApiBulkResponse<T> {
  success: boolean;
  message: string;
  payload: T[];
}

export type CourseResponse = ApiListResponse<Course>;
export type UnitResponse = ApiBulkResponse<Unit>;
export type ModuleResponse = ApiBulkResponse<Module>;
