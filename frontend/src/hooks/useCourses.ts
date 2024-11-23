import {
  fetchCourse,
  fetchCourses,
  CourseFetchParams,
} from "@/src/features/course/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Course } from "@/src/features/course/types";
import { ApiResponse, PaginatedPayload } from "../types/api";
import { handleApiError } from "@/src/lib/api/client";

export const useCourses = ({
  userId,
  courseId,
  currentPage,
  pageSize,
  filter,
  type,
}: CourseFetchParams) => {
  console.log(
    "useCourses Called with PARAMS:",
    userId,
    courseId,
    currentPage,
    pageSize,
    type,
    filter
  );
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey: ["courses", userId, currentPage, pageSize, filter, type],
    queryFn: async ({ pageParam }: any) => {
      try {
        const axiosResponse = await fetchCourses({
          userId,
          currentPage: pageParam,
          pageSize,
          filter,
          type,
        });
        const response = axiosResponse.data as ApiResponse<
          PaginatedPayload<Course>
        >;

        if (!response.payload) {
          throw new Error("No data received");
        }

        if (!response.success) {
          throw new Error(response.message);
        }

        return response.payload;
      } catch (error: any) {
        throw new Error(handleApiError(error));
      }
    },
    getNextPageParam: (lastPage: PaginatedPayload<Course>) => {
      if (lastPage.pagination.currentPage < lastPage.pagination.totalPages) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: Boolean(userId && currentPage && pageSize),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const courses = data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  return {
    courses,
    totalItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: status === "pending",
    error,
  };
};

export const useCourse = ({
  userId,
  courseId,
  filter,
  type,
}: CourseFetchParams) => {
  const {
    data: course,
    isPending: isCoursePending,
    error: courseError,
  } = useQuery({
    queryKey: ["course", userId, courseId, filter, type],
    queryFn: async () => {
      try {
        const axiosResponse = await fetchCourse({
          userId,
          courseId,
          type,
          filter,
        });
        const response = axiosResponse.data as ApiResponse<Course>;

        if (!response.success) {
          throw new Error(response.message);
        }

        return response.payload;
      } catch (error: any) {
        throw new Error(handleApiError(error));
      }
    },
  });

  return {
    course,
    isCoursePending,
    courseError,
  };
};
