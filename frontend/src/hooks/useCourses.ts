import {
  fetchCourse,
  fetchCourses,
  CourseFetchParams,
} from "@/src/features/course/api";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Course } from "@/src/features/course/types";
import { ApiResponse, PaginatedPayload } from "../types/apiTypes";
import { handleApiError } from "@/src/lib/api/client";

export const useCourses = ({
  userId,
  courseId,
  currentPage,
  pageSize,
  filter,
  type,
  include,
}: CourseFetchParams) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey: ["courses", filter, type, userId],
    queryFn: async ({ pageParam }: any) => {
      try {
        const axiosResponse = await fetchCourses({
          userId,
          currentPage: pageParam,
          pageSize,
          filter,
          type,
          include,
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
    throwOnError: true,
  });

  const {
    data: course,
    isPending: isCoursePending,
    error: courseError,
  } = useQuery({
    queryKey: ["course", courseId, userId, filter, type],
    queryFn: async () => {
      try {
        const axiosResponse = await fetchCourse({
          userId,
          courseId,
          filter,
          type,
          include,
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

  const courses = data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = data?.pages[0]?.pagination.totalItems ?? 0;

  return {
    course,
    isCoursePending,
    courseError,
    courses,
    totalItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: status === "pending",
    error,
  };
};
