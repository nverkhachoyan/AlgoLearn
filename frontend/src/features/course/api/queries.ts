import api from "@/src/lib/api/client";
import { Course } from "@/src/types/courses";
import { PaginatedResponse, Response } from "@/src/types/apiTypes";
import { UseProgressParams } from "@/src/types/hooks";

export const fetchCourses = async ({
  userId,
  page,
  pageSize,
  filter,
  type,
  include,
}: UseProgressParams): Promise<PaginatedResponse> => {
  const response = await api.get(`/courses`, {
    params: {
      userId,
      page,
      pageSize,
      filter,
      type,
      include: "progress",
    },
  });
  return response.data.data;
};

export const fetchCourse = async ({
  userId,
  courseId,
  filter,
  type,
}: UseProgressParams): Promise<Course> => {
  const response = await api.get(`/courses/${courseId}`, {
    params: {
      userId,
      filter,
      type,
    },
  });
  return response.data.data;
};
