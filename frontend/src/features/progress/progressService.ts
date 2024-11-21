import api from "@/src/lib/api/client";
import { CourseProgressSummary } from "@/src/types/progress";
import { PaginatedResponse, Response } from "@/src/types/apiTypes";
import { UseProgressParams } from "@/src/types/hooks";

export const fetchCoursesProgress = async ({
  userId,
  page,
  pageSize,
  filter,
  type,
}: UseProgressParams): Promise<PaginatedResponse> => {
  const response = await api.get(
    `progress/courses?user_id=${userId}&page=${page}&page_size=${pageSize}&filter=${filter}&type=${type}`
  );
  return response.data.data;
};

export const fetchCourseProgress = async ({
  userId,
  courseId,
  filter,
  type,
}: UseProgressParams): Promise<CourseProgressSummary> => {
  const response = await api.get(
    `progress/courses/${courseId}?user_id=${userId}&filter=${filter}&type=${type}`
  );
  return response.data.data;
};
