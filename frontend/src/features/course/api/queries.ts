import api from "@/src/lib/api/client";
import { AxiosResponse } from "axios";
import { CourseFetchParams } from "./types";

export const fetchCourses = async ({
  userId,
  currentPage,
  pageSize,
  filter,
  type,
  include,
}: CourseFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(`/courses`, {
    params: {
      userId,
      currentPage,
      pageSize,
      filter,
      type,
      include,
    },
  });
  return response;
};

export const fetchCourse = async ({
  userId,
  courseId,
  filter,
  type,
  include,
}: CourseFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(`/courses/${courseId}`, {
    params: {
      userId,
      filter,
      type,
      include,
    },
  });
  return response;
};
