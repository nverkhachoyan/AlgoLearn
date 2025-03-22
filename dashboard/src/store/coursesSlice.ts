import { Course, Unit, Module } from "../types/models";
import { RequestController } from "./types";
import { apiUrl, parseImgKey } from "./utils";
import { StateCreator } from "zustand";
import { RcFile } from "antd/es/upload/interface";
import { v4 as uuidv4 } from "uuid";
import { apiService } from "./apiService";

export interface CoursesState {
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
  moduleNavigation: {
    nextModuleId: number | null;
    prevModuleId: number | null;
    nextUnitId: number | null;
    prevUnitId: number | null;
    nextUnitModuleId: number | null;
    prevUnitModuleId: number | null;
  } | null;

  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  useSystemTheme: boolean;
  requestControllers: RequestController;

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
  ) => Promise<Response | undefined>;

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
  setIsDarkMode: (isDark: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDarkMode: () => void;
  setUseSystemTheme: (useSystem: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type CourseStoreCreator<T> = StateCreator<CoursesState, [], [], T>;
export type SetCourseState = Parameters<CourseStoreCreator<CoursesState>>[0];
export type GetCourseState = () => CoursesState;

const createCoursesSlice = (set: SetCourseState, get: () => CoursesState) => {
  return {
    courses: [],
    selectedCourse: null,
    selectedUnit: null,
    selectedModule: null,
    isLoading: false,
    error: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    moduleNavigation: null,
    requestControllers: {},

    // UI STATE
    sidebarCollapsed: false,
    isDarkMode: false,
    useSystemTheme: true,

    // UI ACTIONS
    setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
    setSidebarCollapsed: (collapsed: boolean) =>
      set({ sidebarCollapsed: collapsed }),
    toggleDarkMode: () =>
      set((state: CoursesState) => ({ isDarkMode: !state.isDarkMode })),
    setUseSystemTheme: (useSystem: boolean) =>
      set({ useSystemTheme: useSystem }),

    // COURSE ACTIONS
    setLoading: (isLoading: boolean) => set({ isLoading }),
    setError: (error: string | null) => set({ error }),
    setCourses: (courses: Course[]) => set({ courses }),
    setPagination: (pagination: {
      current: number;
      pageSize: number;
      total: number;
    }) => set({ pagination }),
    selectCourse: (course: Course | null) => set({ selectedCourse: course }),
    selectUnit: (unit: Unit | null) => set({ selectedUnit: unit }),
    selectModule: (module: Module | null) => set({ selectedModule: module }),

    fetchCourses: async (page = 1, pageSize = 10) => {
      const abortController = new AbortController();

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses?page=${page}&pageSize=${pageSize}`,
          {
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch courses");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch courses");
        }

        set({
          courses: data.payload.items || [],
          pagination: {
            current: data.payload.pagination.currentPage,
            pageSize: data.payload.pagination.pageSize,
            total: data.payload.pagination.totalItems,
          },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      }
    },

    fetchCourse: async (courseId: number) => {
      const abortController = new AbortController();

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}`,
          {
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch course");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch course");
        }

        set({
          selectedCourse: data.payload || null,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      }
    },

    createCourse: async (course: Partial<Course>, iconFile?: RcFile) => {
      const state = get();
      set({ isLoading: true, error: null });
      try {
        const parentObjectKey = "courses";
        const subObjectKey = uuidv4();
        if (iconFile) {
          const presignedUrl = await state.getPresignedUrl(
            iconFile.name,
            parentObjectKey,
            subObjectKey,
            iconFile.type
          );
          if (presignedUrl) {
            const response = await state.uploadToS3(
              iconFile,
              presignedUrl.url,
              true
            );
            if (!response?.ok) {
              throw new Error("Failed to upload icon to S3");
            }

            if (presignedUrl.key) {
              const parsedImgKey = parseImgKey(presignedUrl.key);
              if (parsedImgKey) {
                course.imgKey = parsedImgKey.imgObjectKey;
                course.mediaExt = parsedImgKey.mediaExtension;
                course.folderObjectKey = subObjectKey.toString();
              }
            }
          }
        }

        const response = await apiService.fetch(`${apiUrl}/courses`, {
          method: "POST",
          body: JSON.stringify(course),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to create course");
        }
        const newCourse = await response.json();
        set((state) => ({
          courses: [...state.courses, newCourse],
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateCourse: async (id: number, course: Partial<Course>) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(`${apiUrl}/courses/${id}`, {
          method: "PUT",
          body: JSON.stringify(course),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to update course");
        }
        const updatedCourse = await response.json();
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === id ? updatedCourse : c
          ),
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        set({
          error: (error as Error).message || "An unexpected error occurred",
          isLoading: false,
        });
      }
    },

    deleteCourse: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(`${apiUrl}/courses/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete course");
        set((state: CoursesState) => ({
          courses: state.courses.filter((c: Course) => c.id !== id),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    // Unit actions
    createUnit: async (courseId: number, unit: Partial<Unit>) => {
      set({ isLoading: true, error: null });
      try {
        console.log("UNIT", unit);
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units`,
          {
            method: "POST",

            body: JSON.stringify(unit),
          }
        );
        if (!response.ok) throw new Error("Failed to create unit");
        const data = await response.json();
        const newUnit = data.payload;
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? { ...c, units: [...(c.units ?? []), newUnit] }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateUnit: async (
      courseId: number,
      unitId: number,
      unit: Partial<Unit>
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}`,
          {
            method: "PUT",
            body: JSON.stringify(unit),
          }
        );
        if (!response.ok) throw new Error("Failed to update unit");
        const updatedUnit = await response.json();
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.map((u: Unit) =>
                    u.id === unitId ? updatedUnit : u
                  ),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    deleteUnit: async (courseId: number, unitId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to delete unit");
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.filter((u: Unit) => u.id !== unitId),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    // Module actions

    fetchModule: async (
      courseId: number,
      unitId: number,
      moduleId: number
    ): Promise<void> => {
      const abortController = new AbortController();

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
          {
            signal: abortController.signal,
          }
        );

        if (!response.ok) {
          const error = await response.json();
          set({
            error: error.message || "Failed to fetch module",
            isLoading: false,
          });
          return;
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch module");
        }

        set({
          selectedModule: data.payload.module || null,
          isLoading: false,
          error: null,
          moduleNavigation: {
            nextModuleId: data.payload.nextModuleId || null,
            prevModuleId: data.payload.prevModuleId || null,
            nextUnitId: data.payload.nextUnitId || null,
            prevUnitId: data.payload.prevUnitId || null,
            nextUnitModuleId: data.payload.nextUnitModuleId || null,
            prevUnitModuleId: data.payload.prevUnitModuleId || null,
          },
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set({
            error: (error as Error).message,
            isLoading: false,
          });
        }
      }
    },

    createModule: async (
      courseId: number,
      unitId: number,
      module: Partial<Module>
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules`,
          {
            method: "POST",
            body: JSON.stringify(module),
          }
        );
        if (!response.ok) throw new Error("Failed to create module");
        const newModule = await response.json();
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.map((u: Unit) =>
                    u.id === unitId
                      ? { ...u, modules: [...u.modules, newModule] }
                      : u
                  ),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    updateModule: async (
      courseId: number,
      unitId: number,
      moduleId: number,
      module: Partial<Module>
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
          {
            method: "PUT",
            body: JSON.stringify(module),
          }
        );
        if (!response.ok) throw new Error("Failed to update module");
        const updatedModule = await response.json();
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.map((u: Unit) =>
                    u.id === unitId
                      ? {
                          ...u,
                          modules: u.modules.map((m: Module) =>
                            m.id === moduleId ? updatedModule : m
                          ),
                        }
                      : u
                  ),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    deleteModule: async (
      courseId: number,
      unitId: number,
      moduleId: number
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) throw new Error("Failed to delete module");
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.map((u: Unit) =>
                    u.id === unitId
                      ? {
                          ...u,
                          modules: u.modules.filter(
                            (m: Module) => m.id !== moduleId
                          ),
                        }
                      : u
                  ),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    answerQuestion: async (
      courseId: number,
      unitId: number,
      moduleId: number,
      sectionId: number,
      optionId: number
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}/sections/${sectionId}/answer`,
          {
            method: "POST",
            body: JSON.stringify({ optionId }),
          }
        );
        if (!response.ok) throw new Error("Failed to submit answer");
        const data = await response.json();

        // Update the module with the new answer data
        set((state: CoursesState) => ({
          courses: state.courses.map((c: Course) =>
            c.id === courseId
              ? {
                  ...c,
                  units: c.units.map((u: Unit) =>
                    u.id === unitId
                      ? {
                          ...u,
                          modules: u.modules.map((m: Module) =>
                            m.id === moduleId
                              ? {
                                  ...m,
                                  sections: m.sections.map((s) =>
                                    s.id === sectionId
                                      ? {
                                          ...s,
                                          content: {
                                            ...s.content,
                                            userQuestionAnswer: data.answer,
                                          },
                                        }
                                      : s
                                  ),
                                }
                              : m
                          ),
                        }
                      : u
                  ),
                }
              : c
          ),
          isLoading: false,
        }));
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    // Utility functions
    getPresignedUrl: async (
      fileName: string,
      parentObjectKey: string,
      subObjectKey: string,
      contentType: string
    ): Promise<Record<string, string> | undefined> => {
      set({ isLoading: true, error: null });
      try {
        const fullFolderPath = `${parentObjectKey}/${subObjectKey}`;
        const response = await apiService.fetch(`${apiUrl}/upload/presign`, {
          method: "POST",
          body: JSON.stringify({
            fileName,
            folder: fullFolderPath,
            contentType,
          }),
        });
        if (!response.ok) throw new Error("Failed to get presigned URL");
        const data = await response.json();
        return data.payload;
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    uploadToS3: async (
      file: RcFile,
      presignedUrl: string,
      isPublic: boolean
    ) => {
      set({ isLoading: true, error: null });
      try {
        const response = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
            "Content-Length": file.size.toString(),
            "x-amz-acl": isPublic ? "public-read" : "private",
          },
          body: file,
        });
        if (!response.ok) throw new Error("Failed to upload to S3");
        return response;
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
      }
    },

    abortRequest: (requestType: string) => {
      const state = get();
      const controller = state.requestControllers[requestType];
      if (controller) {
        controller.abort();
        set((state) => ({
          requestControllers: {
            ...state.requestControllers,
            [requestType]: null,
          },
        }));
      }
    },
  };
};

export default createCoursesSlice;
