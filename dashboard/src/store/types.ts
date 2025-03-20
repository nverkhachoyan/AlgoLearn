import { StateCreator } from "zustand";
import { Course, Unit, Module } from "../types/models";
import type { RcFile } from "antd/es/upload/interface";
export interface RequestController {
  [key: string]: AbortController | null;
}

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
}

export interface StoreState {
  // Course state
  courses: Course[];
  selectedCourse: Course | null;
  selectedUnit: Unit | null;
  selectedModule: Module | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };

  // Auth state
  token: string;
  authError: string | null;
  user: User | null;
  isAuthenticated: boolean;

  // UI state
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  requestControllers: RequestController;

  // Navigation state
  moduleNavigation: {
    nextModuleId: number;
    prevModuleId: number;
    nextUnitId: number;
    prevUnitId: number;
    nextUnitModuleId: number;
    prevUnitModuleId: number;
  } | null;

  getPresignedUrl: (
    fileName: string,
    parentObjectKey: string,
    subObjectKey: string,
    contentType: string
  ) => Promise<Record<string, string> | undefined>;
  uploadToS3: (
    file: RcFile,
    presignedUrl: string,
    isPublic: boolean
  ) => Promise<Response>;

  // Course actions
  fetchCourses: (page?: number, pageSize?: number) => Promise<void>;
  fetchCourse: (id: number) => Promise<void>;
  createCourse: (course: Partial<Course>, iconFile?: RcFile) => Promise<void>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  selectCourse: (course: Course | null) => void;

  // Unit actions
  createUnit: (courseId: number, unit: Partial<Unit>) => Promise<void>;
  updateUnit: (
    courseId: number,
    unitId: number,
    unit: Partial<Unit>
  ) => Promise<void>;
  deleteUnit: (courseId: number, unitId: number) => Promise<void>;
  selectUnit: (unit: Unit | null) => void;

  // Module actions
  fetchModule: (
    courseId: number,
    unitId: number,
    moduleId: number
  ) => Promise<void>;
  createModule: (
    courseId: number,
    unitId: number,
    module: Partial<Module>
  ) => Promise<void>;
  updateModule: (
    courseId: number,
    unitId: number,
    moduleId: number,
    module: Partial<Module>
  ) => Promise<void>;
  deleteModule: (
    courseId: number,
    unitId: number,
    moduleId: number
  ) => Promise<void>;
  selectModule: (module: Module | null) => void;
  answerQuestion: (
    courseId: number,
    unitId: number,
    moduleId: number,
    sectionId: number,
    optionId: number
  ) => Promise<void>;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // UI actions
  setIsDarkMode: (isDark: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type StoreCreator<T> = StateCreator<StoreState, [], [], T>;
export type SetState = Parameters<StoreCreator<StoreState>>[0];
export type GetState = () => StoreState;
