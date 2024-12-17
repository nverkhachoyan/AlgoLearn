import {
  fetchCourse,
  fetchCourses,
  CourseFetchParams,
} from "@/src/features/course/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Course } from "@/src/features/course/types";
import { ApiResponse, PaginatedPayload } from "../../../types/api";
import { handleApiError } from "@/src/lib/api/client";

// Helper function to handle API responses
const handleResponse = <T>(response: ApiResponse<T>) => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.payload;
};

export const useCourses = ({
  userId,
  currentPage,
  pageSize,
  filter,
  type,
}: CourseFetchParams) => {
  const queryResult = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey: ["courses", { userId, filter, type, pageSize }],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data } = await fetchCourses({
          userId,
          currentPage: pageParam as number,
          pageSize,
          filter,
          type,
        });

        if (!data.payload) {
          throw new Error("No data received");
        }

        return handleResponse(data);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    enabled: Boolean(userId && pageSize),
    staleTime: 5 * 60 * 1000,
  });

  return {
    courses: queryResult.data?.pages.flatMap((page) => page.items) ?? [],
    totalItems: queryResult.data?.pages[0]?.pagination.totalItems ?? 0,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.status === "pending",
    error: queryResult.error,
  };
};

export const useCourse = ({
  userId,
  courseId,
  filter,
  type,
}: CourseFetchParams) => {
  const queryResult = useQuery<Course>({
    queryKey: ["course", { userId, courseId, filter, type }],
    queryFn: async () => {
      try {
        const { data } = await fetchCourse({
          userId,
          courseId,
          type,
          filter,
        });
        return handleResponse(data);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    enabled: Boolean(userId && courseId),
    staleTime: 10 * 60 * 1000,
  });

  return {
    course: queryResult.data,
    isLoading: queryResult.isPending,
    error: queryResult.error,
  };
};
