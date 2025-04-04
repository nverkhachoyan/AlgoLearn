import { Course, Unit, Module, Section, LottieContent } from "../types/models";
import { apiUrl } from "./utils";
import { RcFile } from "antd/es/upload/interface";
import { v4 as uuidv4 } from "uuid";
import { apiService } from "./apiService";
import { SetState, GetState } from ".";
import { isNewImage, isNewLottie, NewImage, NewSection } from "./types";

export interface CoursesState {
  courses: Course[];
  selectedCourse: Course | null;
  selectedUnit: Unit | null;
  selectedModule: Module | null;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  isCourseLoading: boolean;
  moduleNavigation: {
    nextModuleId: number | null;
    prevModuleId: number | null;
    nextUnitId: number | null;
    prevUnitId: number | null;
    nextUnitModuleId: number | null;
    prevUnitModuleId: number | null;
  } | null;

  getPresignedUrl: (
    fileName: string,
    folder: string,
    subFolder: string,
    contentType: string
  ) => Promise<Record<string, string> | undefined>;
  uploadToS3: (
    file: File,
    presignedUrl: string,
    isPublic: boolean
  ) => Promise<Response | undefined>;
  deleteFromS3: (
    folder: string,
    subFolder: string,
    fileName: string
  ) => Promise<void>;
  cleanupS3Objects: (
    objects: Array<{ folder: string; subFolder: string; objectKey: string }>
  ) => Promise<void>;

  // Course actions
  fetchCourses: (page?: number, pageSize?: number) => Promise<void>;
  fetchCourse: (id: number) => Promise<void>;
  createCourse: (course: Partial<Course>, iconFile?: RcFile) => Promise<void>;
  updateCourse: (id: number, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: number) => Promise<void>;

  // Unit actions
  createUnit: (courseId: number, unit: Partial<Unit>) => Promise<void>;
  fetchUnit: (courseId: number, unitId: number) => Promise<void>;
  updateUnit: (
    courseId: number,
    unitId: number,
    unit: Partial<Unit>
  ) => Promise<void>;
  deleteUnit: (courseId: number, unitId: number) => Promise<void>;

  // Module actions
  fetchModule: (
    courseId: number,
    unitId: number,
    moduleId: number
  ) => Promise<void>;
  createModule: (
    courseId: number,
    unitId: number,
    module: Partial<Module>,
    newSections: NewSection[]
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

  answerQuestion: (
    courseId: number,
    unitId: number,
    moduleId: number,
    sectionId: number,
    optionId: number
  ) => Promise<void>;
}

const createCoursesSlice = (
  set: SetState<CoursesState>,
  get: GetState<CoursesState>
) => {
  return {
    courses: [],
    selectedCourse: null,
    selectedUnit: null,
    selectedModule: null,
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    isCourseLoading: false,
    moduleNavigation: null,

    setCourses: (courses: Course[]) => set({ courses }),
    setPagination: (pagination: {
      current: number;
      pageSize: number;
      total: number;
    }) => set({ pagination }),

    fetchCourses: async (page = 1, pageSize = 10) => {
      set({ isCourseLoading: true });

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses?page=${page}&pageSize=${pageSize}`
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
          isCourseLoading: false,
        });
      } catch (error) {
        set({ isCourseLoading: false, error: (error as Error).message });
      }
    },

    fetchCourse: async (courseId: number) => {
      set({ isCourseLoading: true, error: null });

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}`
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
          isCourseLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          error: (error as Error).message,
          isCourseLoading: false,
        });
      }
    },

    createCourse: async (course: Partial<Course>, iconFile?: RcFile) => {
      const state = get();

      set({ isCourseLoading: true });

      try {
        const parentFolder = "courses";
        const subFolder = uuidv4();
        if (iconFile) {
          const presignedUrl = await state.getPresignedUrl(
            iconFile.name,
            parentFolder,
            subFolder,
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
              course.imgKey = presignedUrl.key;
              course.mediaExt = presignedUrl.ext;
              course.folderObjectKey = subFolder.toString();
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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          error: (error as Error).message,
          isCourseLoading: false,
        });
      }
    },

    updateCourse: async (id: number, course: Partial<Course>) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
          error: null,
        }));
      } catch (error) {
        set({
          error: (error as Error).message || "An unexpected error occurred",
          isCourseLoading: false,
        });
      }
    },

    deleteCourse: async (id: number) => {
      set({ isCourseLoading: true, error: null });

      try {
        const response = await apiService.fetch(`${apiUrl}/courses/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to delete course");
        set((state: CoursesState) => ({
          courses: state.courses.filter((c: Course) => c.id !== id),
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    // Unit actions
    createUnit: async (courseId: number, unit: Partial<Unit>) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    fetchUnit: async (courseId: number, unitId: number) => {
      set({ isCourseLoading: true });

      try {
        await get().fetchCourse(courseId);
        const freshState = get();
        const unit = freshState.selectedCourse?.units.find(
          (u) => u.id === unitId
        );

        set({
          selectedUnit: unit,
          isCourseLoading: false,
        });
      } catch {
        set({
          isCourseLoading: false,
        });
        throw new Error("failed to fetch unit");
      }
    },

    updateUnit: async (
      courseId: number,
      unitId: number,
      unit: Partial<Unit>
    ) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    deleteUnit: async (courseId: number, unitId: number) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    // Module actions

    fetchModule: async (
      courseId: number,
      unitId: number,
      moduleId: number
    ): Promise<void> => {
      set({ isCourseLoading: true, error: null });

      try {
        const response = await apiService.fetch(
          `${apiUrl}/courses/${courseId}/units/${unitId}/modules/${moduleId}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to fetch module");
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message || "Failed to fetch module");
        }

        set({
          selectedModule: data.payload.module || null,
          moduleNavigation: {
            nextModuleId: data.payload.nextModuleId || null,
            prevModuleId: data.payload.prevModuleId || null,
            nextUnitId: data.payload.nextUnitId || null,
            prevUnitId: data.payload.prevUnitId || null,
            nextUnitModuleId: data.payload.nextUnitModuleId || null,
            prevUnitModuleId: data.payload.prevUnitModuleId || null,
          },
          isCourseLoading: false,
          error: null,
        });
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    createModule: async (
      courseId: number,
      unitId: number,
      module: Partial<Module>,
      newSections: NewSection[]
    ) => {
      set({ isCourseLoading: true });
      const state = get();
      const uploadedObjects: Array<{
        folder: string;
        subFolder: string;
        objectKey: string;
      }> = [];

      try {
        module.folderObjectKey = uuidv4();

        const sectionPromises = newSections.map(async (s) => {
          if (isNewLottie(s)) {
            if (!s.content.file) {
              throw new Error("Lottie section missing animation file");
            }
            const folderName = "modules";
            const subFolder = module.folderObjectKey;
            if (!subFolder) {
              throw new Error(
                "Module does not have a valid UUID for folderObjectKey"
              );
            }
            const presignedURL = await state.getPresignedUrl(
              s.content.file.name,
              folderName,
              subFolder,
              subFolder
            );
            if (!presignedURL) {
              throw new Error(
                "Failed to get a presigned URL for S3 for animation file"
              );
            }

            const resp = await state.uploadToS3(
              s.content.file,
              presignedURL.url,
              true
            );

            if (resp?.status !== 200) {
              throw new Error("failed to upload to S3");
            }

            s.content.objectKey = presignedURL.key;
            s.content.mediaExt = presignedURL.ext;

            uploadedObjects.push({
              folder: folderName,
              subFolder,
              objectKey: presignedURL.url,
            });

            return {
              type: s.type,
              position: s.position,
              content: {
                objectKey: s.content.objectKey,
                mediaExt: s.content.mediaExt,
                caption: s.content.caption,
                description: s.content.description,
                width: s.content.width,
              } as LottieContent,
            } as Section;
          }

          if (isNewImage(s)) {
            if (!s.content.file) {
              throw new Error(`Image section ${s.position} missing image file`);
            }
            const folderName = "modules";
            const subFolder = module.folderObjectKey;
            if (!subFolder) {
              throw new Error(
                "Module does not have a valid UUID for folderObjectKey"
              );
            }
            const presignedURL = await state.getPresignedUrl(
              s.content.file.name,
              folderName,
              subFolder,
              subFolder
            );
            if (!presignedURL) {
              throw new Error(
                "Failed to get a presigned URL for S3 to upload image"
              );
            }

            const resp = await state.uploadToS3(
              s.content.file,
              presignedURL.url,
              true
            );

            if (resp?.status !== 200) {
              throw new Error("failed to upload image to S3");
            }

            s.content.objectKey = presignedURL.key;
            s.content.mediaExt = presignedURL.ext;

            uploadedObjects.push({
              folder: folderName,
              subFolder,
              objectKey: presignedURL.url,
            });

            return {
              type: s.type,
              position: s.position,
              content: {
                objectKey: s.content.objectKey,
                mediaExt: s.content.mediaExt,
                headline: s.content.headline,
                caption: s.content.caption,
                altText: s.content.altText,
                width: s.content.width,
                height: s.content.height,
              } as NewImage,
            } as Section;
          }

          return s;
        });

        module.sections = await Promise.all(sectionPromises);

        try {
          const response = await apiService.fetch(
            `${apiUrl}/courses/${courseId}/units/${unitId}/modules`,
            {
              method: "POST",
              body: JSON.stringify(module),
            }
          );
          if (!response.ok) throw new Error("Failed to create module");
          const data = await response.json();
          const newModule = data.payload;

          const state = get();
          if (state.courses && state.courses.length) {
            set((state: CoursesState) => ({
              courses: state?.courses.map((c: Course) =>
                c.id === courseId
                  ? {
                      ...c,
                      units: c?.units.map((u: Unit) =>
                        u.id === unitId
                          ? { ...u, modules: [...u.modules, newModule] }
                          : u
                      ),
                    }
                  : c
              ),
              isCourseLoading: false,
            }));
          } else {
            set({ isCourseLoading: false });
          }
        } catch {
          await state.cleanupS3Objects(uploadedObjects);
          set({
            isCourseLoading: false,
          });
          throw new Error("failed to create module");
        }
      } catch (error) {
        await state.cleanupS3Objects(uploadedObjects);
        set({
          isCourseLoading: false,
        });
        throw new Error(`Creating module: ${error}`);
      }
    },

    updateModule: async (
      courseId: number,
      unitId: number,
      moduleId: number,
      module: Partial<Module>
    ) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    deleteModule: async (
      courseId: number,
      unitId: number,
      moduleId: number
    ) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    answerQuestion: async (
      courseId: number,
      unitId: number,
      moduleId: number,
      sectionId: number,
      optionId: number
    ) => {
      set({ isCourseLoading: true, error: null });

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
          isCourseLoading: false,
        }));
      } catch (error) {
        set({
          isCourseLoading: false,
          error: (error as Error).message,
        });
      }
    },

    // Utility functions
    getPresignedUrl: async (
      fileName: string,
      folder: string,
      subFolder: string,
      contentType: string
    ): Promise<{ key: string; ext: string; url: string } | undefined> => {
      set({ error: null });

      try {
        const response = await apiService.fetch(`${apiUrl}/storage/presign`, {
          method: "POST",
          body: JSON.stringify({
            filename: fileName,
            folder: folder,
            subFolder: subFolder,
            contentType,
          }),
        });
        if (!response.ok) throw new Error("Failed to get presigned URL");
        const data = await response.json();
        return data.payload;
      } catch (error) {
        set({ error: (error as Error).message });
      }
    },

    uploadToS3: async (file: File, presignedUrl: string, isPublic: boolean) => {
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
        if (!response.ok) {
          set({ error: "Failed to upload to S3" });
        }
        return response;
      } catch {
        throw new Error("failed to upload to S3");
      }
    },

    deleteFromS3: async (
      folder: string,
      subFolder: string,
      fileName: string
    ) => {
      try {
        const response = await apiService.fetch(`${apiUrl}/storage/delete`, {
          method: "POST",
          body: JSON.stringify({
            fileName,
            folder: folder,
            subFolder: subFolder,
          }),
        });
        if (!response.ok) throw new Error("failed to delete S3 file");
        const data = await response.json();
        return data.payload;
      } catch {
        throw new Error("failed to delete from S3");
      }
    },

    cleanupS3Objects: async (
      objects: Array<{ folder: string; subFolder: string; objectKey: string }>
    ) => {
      const state = get();

      for (const obj of objects) {
        try {
          await state.deleteFromS3(obj.folder, obj.subFolder, obj.objectKey);
        } catch (err) {
          console.error(`Failed to delete S3 object: ${obj.objectKey}`, err);
          throw new Error(`Failed to delete S3 object: ${obj.objectKey}`);
        }
      }
    },
  };
};

export default createCoursesSlice;
