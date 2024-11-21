import api from "@/src/lib/api/client";
import { CourseProgressSummary } from "@/src/types/progress";
import { PaginatedResponse, Response } from "@/src/types/apiTypes";
import { UseProgressParams } from "@/src/types/hooks";

export const fetchCoursesProgress = async ({
  user_id,
  page,
  pageSize,
  filter,
  type,
}: UseProgressParams): Promise<PaginatedResponse> => {
  const response = await api.get(
    `progress/courses?user_id=${user_id}&page=${page}&page_size=${pageSize}&filter=${filter}&type=${type}`
  );
  return response.data.data;
};

export const fetchCourseProgress = async ({
  user_id,
  course_id,
  filter,
  type,
}: UseProgressParams): Promise<CourseProgressSummary> => {
  const response = await api.get(
    `progress/courses/${course_id}?user_id=${user_id}&filter=${filter}&type=${type}`
  );
  return response.data.data;
};
