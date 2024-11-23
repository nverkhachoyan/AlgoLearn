import api from "@/src/lib/api/client";
import { AxiosResponse } from "axios";
import { CourseFetchParams } from "./types";

export const fetchCourses = async ({
  userId,
  currentPage,
  pageSize,
  filter,
  type,
}: CourseFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(`/courses`, {
    params: {
      userId,
      currentPage,
      pageSize,
      filter,
      type,
    },
  });
  return response;
};

export const fetchCourse = async ({
  userId,
  courseId,
  type,
  filter,
}: CourseFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(`/courses/${courseId}`, {
    params: {
      userId,
      type,
      filter,
    },
  });
  return response;
};
