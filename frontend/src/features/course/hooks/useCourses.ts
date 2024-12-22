import {
  listCourses,
  getCourse,
  listCoursesProgress,
  getCourseProgress,
  startCourse,
  restartCourse,
} from "@/src/features/course/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
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

interface CourseQueryParams {
  pageSize: number;
  isAuthenticated?: boolean;
}

// Hook for listing courses (public or with progress)
export const useCourses = ({
  pageSize,
  isAuthenticated = false,
}: CourseQueryParams) => {
  const queryKey = isAuthenticated ? ["courses", "progress"] : ["courses"];

  const queryResult = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data } = isAuthenticated
          ? await listCoursesProgress({
              page: pageParam as number,
              pageSize,
            })
          : await listCourses({
              page: pageParam as number,
              pageSize,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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

interface CourseParams {
  courseId: number;
  isAuthenticated?: boolean;
}

// Hook for getting a single course (public or with progress)
export const useCourse = ({
  courseId,
  isAuthenticated = false,
}: CourseParams) => {
  const queryKey = isAuthenticated
    ? ["course", courseId, "progress"]
    : ["course", courseId];

  const queryResult = useQuery<Course>({
    queryKey,
    queryFn: async () => {
      try {
        const { data } = isAuthenticated
          ? await getCourseProgress(courseId)
          : await getCourse(courseId);
        return handleResponse(data);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    enabled: Boolean(courseId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    course: queryResult.data,
    isLoading: queryResult.isPending,
    error: queryResult.error,
  };
};

// Response types
interface StartCourseResponse {
  success: boolean;
  message: string;
  payload: {
    unitId: number;
    moduleId: number;
  };
}

interface RestartCourseResponse {
  success: boolean;
  message: string;
}

// Hook for starting a course
export const useStartCourse = (courseId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<StartCourseResponse["payload"], Error>({
    mutationFn: async () => {
      if (!courseId) {
        throw new Error("courseId is required to start a course");
      }

      try {
        const { data } = await startCourse(courseId);
        if (!data.success || !data.payload) {
          throw new Error(data.message || "Failed to start course");
        }
        return data.payload;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, "progress"],
      });
      queryClient.invalidateQueries({ queryKey: ["courses", "progress"] });
    },
  });

  return {
    startCourse: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};

// Hook for restarting a course
export const useRestartCourse = (courseId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<RestartCourseResponse, Error>({
    mutationFn: async () => {
      if (!courseId) {
        throw new Error("courseId is required to restart course");
      }

      try {
        const { data } = await restartCourse(courseId);
        if (!data.success) {
          throw new Error(data.message || "Failed to restart course");
        }
        return data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["course", courseId, "progress"],
      });
      queryClient.invalidateQueries({ queryKey: ["courses", "progress"] });
    },
  });

  return {
    restartCourse: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};
