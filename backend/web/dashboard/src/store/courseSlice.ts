import { Course, Unit, Module } from "../types/models";
import { getAuthHeaders, apiUrl } from "./utils";
import { RequestController, SetState, StoreState } from "./types";
import { ModuleResponse } from "../types/api";

interface State extends StoreState {
  courses: Course[];
  token: string;
  requestControllers: RequestController;
  isLoading: boolean;
  error: string | null;
}

export interface CourseState {
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
    nextModuleId: number;
    prevModuleId: number;
    nextUnitId: number;
    prevUnitId: number;
    nextUnitModuleId: number;
    prevUnitModuleId: number;
  } | null;

  // Course actions
  fetchCourses: (page?: number, pageSize?: number) => Promise<void>;
  fetchCourse: (id: number) => Promise<void>;
  createCourse: (course: Partial<Course>) => Promise<void>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;
  selectCourse: (course: Course | null) => void;
  abortRequest: (requestType: string) => void;

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
  createModule: (
    courseId: number,
    unitId: number,
    module: Partial<Module>
  ) => Promise<ModuleResponse>;
  updateModule: (
    courseId: number,
    unitId: number,
    moduleId: number,
    module: Module
  ) => Promise<ModuleResponse>;
  deleteModule: (
    courseId: number,
    unitId: number,
    moduleId: number
  ) => Promise<void>;
  selectModule: (module: Module | null) => void;

  // State setters
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setCourses: (courses: Course[]) => void;
  setPagination: (pagination: {
    current: number;
    pageSize: number;
    total: number;
  }) => void;

  // New method
  answerQuestion: (
    courseId: number,
    unitId: number,
    moduleId: number,
    sectionId: number,
    optionId: number
  ) => Promise<void>;
}

const createCoursesSlice = (set: SetState, get: () => StoreState) => ({
  // Initial state
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

  // State setters
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),
  setCourses: (courses: Course[]) => set({ courses }),
  setPagination: (pagination: {
    current: number;
    pageSize: number;
    total: number;
  }) => set({ pagination }),

  // Request management
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

  // Async actions
  fetchCourses: async (page = 1, pageSize = 10) => {
    const state = get();
    const abortController = new AbortController();

    try {
      const response = await fetch(
        `${apiUrl}/courses?page=${page}&pageSize=${pageSize}`,
        {
          headers: getAuthHeaders(state.token),
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
    const state = get();
    const abortController = new AbortController();

    try {
      const response = await fetch(`${apiUrl}/courses/${courseId}`, {
        headers: getAuthHeaders(state.token),
        signal: abortController.signal,
      });

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

  createCourse: async (course: Partial<Course>) => {
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/courses`, {
        method: "POST",
        headers: getAuthHeaders(state.token),
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/courses/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(state.token),
        body: JSON.stringify(course),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update course");
      }
      const updatedCourse = await response.json();
      set((state: StoreState) => ({
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/courses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(state.token),
      });
      if (!response.ok) throw new Error("Failed to delete course");
      set((state: StoreState) => ({
        courses: state.courses.filter((c: Course) => c.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  selectCourse: (course: Course | null) => set({ selectedCourse: course }),
  selectUnit: (unit: Unit | null) => set({ selectedUnit: unit }),
  selectModule: (module: Module | null) => set({ selectedModule: module }),

  // Unit actions
  createUnit: async (courseId: number, unit: Partial<Unit>) => {
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${apiUrl}/courses/${courseId}/units`, {
        method: "POST",
        headers: getAuthHeaders(state.token),
        body: JSON.stringify(unit),
      });
      if (!response.ok) throw new Error("Failed to create unit");
      const newUnit = await response.json();
      set((state: StoreState) => ({
        courses: state.courses.map((c: Course) =>
          c.id === courseId ? { ...c, units: [...c.units, newUnit] } : c
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateUnit: async (courseId: number, unitId: number, unit: Partial<Unit>) => {
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(state.token),
          body: JSON.stringify(unit),
        }
      );
      if (!response.ok) throw new Error("Failed to update unit");
      const updatedUnit = await response.json();
      set((state: StoreState) => ({
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(state.token),
        }
      );
      if (!response.ok) throw new Error("Failed to delete unit");
      set((state: StoreState) => ({
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
    const state = get();
    const abortController = new AbortController();

    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
        {
          headers: getAuthHeaders(state.token),
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}/modules`,
        {
          method: "POST",
          headers: getAuthHeaders(state.token),
          body: JSON.stringify(module),
        }
      );
      if (!response.ok) throw new Error("Failed to create module");
      const newModule = await response.json();
      set((state: StoreState) => ({
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(state.token),
          body: JSON.stringify(module),
        }
      );
      if (!response.ok) throw new Error("Failed to update module");
      const updatedModule = await response.json();
      set((state: StoreState) => ({
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

  deleteModule: async (courseId: number, unitId: number, moduleId: number) => {
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(state.token),
        }
      );
      if (!response.ok) throw new Error("Failed to delete module");
      set((state: StoreState) => ({
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
    const state = get();
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(
        `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}/sections/${sectionId}/answer`,
        {
          method: "POST",
          headers: getAuthHeaders(state.token),
          body: JSON.stringify({ optionId }),
        }
      );
      if (!response.ok) throw new Error("Failed to submit answer");
      const data = await response.json();

      // Update the module with the new answer data
      set((state: StoreState) => ({
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
});

export default createCoursesSlice;
