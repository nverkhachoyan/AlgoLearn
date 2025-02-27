import api from "@/src/features/auth/setup";
import { AxiosResponse } from "axios";

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface SearchCoursesParams extends PaginationParams {
  q: string;
  fulltext?: boolean;
}

interface CourseProgressParams extends PaginationParams {
  page: number;
  pageSize: number;
}

// Public endpoints
export const listCourses = async ({
  page,
  pageSize,
}: PaginationParams): Promise<AxiosResponse> => {
  return api.get(`/courses`, {
    params: {
      page,
      pageSize,
    },
  });
};

export const searchCourses = async ({
  q,
  page,
  pageSize,
  fulltext = false,
}: SearchCoursesParams): Promise<AxiosResponse> => {
  return api.get(`/courses/search`, {
    params: {
      q,
      page,
      pageSize,
      fulltext,
    },
  });
};

export const getCourse = async (courseId: number): Promise<AxiosResponse> => {
  return api.get(`/courses/${courseId}`);
};

// Protected endpoints (require authentication)
export const listCoursesProgress = async ({
  page,
  pageSize,
}: CourseProgressParams): Promise<AxiosResponse> => {
  return api.get(`/courses/progress`, {
    params: {
      page,
      pageSize,
    },
  });
};

export const getCourseProgress = async (
  courseId: number
): Promise<AxiosResponse> => {
  return api.get(`/courses/${courseId}/progress`);
};

export const startCourse = async (courseId: number): Promise<AxiosResponse> => {
  return api.post(`/courses/${courseId}/start`);
};

export const resetCourseProgress = async (
  courseId: number
): Promise<AxiosResponse> => {
  return api.post(`/courses/${courseId}/reset`);
};
