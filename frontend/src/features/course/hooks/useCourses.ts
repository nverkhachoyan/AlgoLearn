import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Course } from '@/src/features/course/types';
import { ApiResponse, PaginatedPayload } from '../../../types/api';
import { useAuthFetcher } from '@/src/features/auth';

// Helper function to handle API responses
const handleResponse = <T>(response: ApiResponse<T>) => {
  if (!response.success) {
    throw new Error(response.message);
  }
  return response.payload;
};

interface CourseQueryParams {
  pageSize: number;
  isAuthed?: boolean;
}

// Hook for listing courses (public or with progress)
export const useCourses = ({ pageSize, isAuthed = false }: CourseQueryParams) => {
  const queryKey = isAuthed ? ['courses', 'progress'] : ['courses'];
  const authFetcher = useAuthFetcher();

  const queryResult = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey,
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const { data } = isAuthed
          ? await authFetcher.get(`/courses/progress`, {
              params: {
                page: pageParam,
                pageSize,
              },
            })
          : await authFetcher.get(`/courses`, {
              params: {
                page: pageParam,
                pageSize,
              },
            });

        if (!data.payload) {
          throw new Error('No data received');
        }

        return handleResponse(data);
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    getNextPageParam: lastPage =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses: queryResult.data?.pages.flatMap(page => page.items) ?? [],
    totalItems: queryResult.data?.pages[0]?.pagination.totalItems ?? 0,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.status === 'pending',
    error: queryResult.error,
  };
};

interface CourseParams {
  courseId: number;
  isAuthed?: boolean;
  hasProgress?: boolean;
}

// Hook for getting a single course (public or with progress)
export const useCourse = ({ courseId, isAuthed, hasProgress }: CourseParams) => {
  const queryKey = isAuthed ? ['course', courseId, 'progress'] : ['course', courseId];
  const authFetcher = useAuthFetcher();

  const queryResult = useQuery<Course>({
    queryKey,
    queryFn: async () => {
      try {
        const { data } =
          isAuthed && hasProgress
            ? await authFetcher.get(`/courses/${courseId}/progress`)
            : await authFetcher.get(`/courses/${courseId}`);
        return handleResponse(data);
      } catch (error) {
        throw new Error((error as Error).message);
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
  const authFetcher = useAuthFetcher();

  const mutation = useMutation<StartCourseResponse['payload'], Error>({
    mutationFn: async () => {
      if (!courseId) {
        throw new Error('courseId is required to start a course');
      }

      try {
        const { data } = await authFetcher.post(`/courses/${courseId}/start`);
        if (!data.success || !data.payload) {
          throw new Error(data.message || 'Failed to start course');
        }
        return data.payload;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['course', courseId, 'progress'],
      });
      queryClient.invalidateQueries({ queryKey: ['courses', 'progress'] });
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
export const useResetCourseProgress = (courseId: number) => {
  const queryClient = useQueryClient();
  const authFetcher = useAuthFetcher();

  const mutation = useMutation<RestartCourseResponse, Error>({
    mutationFn: async () => {
      if (!courseId) {
        throw new Error('courseId is required to restart course');
      }

      try {
        const { data } = await authFetcher.post(`/courses/${courseId}/reset`);
        if (!data.success) {
          throw new Error(data.message || 'Failed to restart course');
        }
        return data;
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['course', courseId, 'progress'],
      });
      queryClient.invalidateQueries({ queryKey: ['courses', 'progress'] });
    },
  });

  return {
    resetCourseProgress: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
  };
};

interface SearchCoursesParams {
  query: string;
  pageSize: number;
  useFullText?: boolean;
}

// Hook for searching courses
export const useSearchCourses = ({ query, pageSize, useFullText = false }: SearchCoursesParams) => {
  const authFetcher = useAuthFetcher();

  const queryResult = useInfiniteQuery<PaginatedPayload<Course>>({
    queryKey: ['courses', 'search', query, useFullText],
    queryFn: async ({ pageParam = 1 }) => {
      if (!query.trim()) {
        return {
          items: [] as Course[],
          pagination: {
            totalItems: 0,
            pageSize,
            currentPage: pageParam as number,
            totalPages: 0,
          },
        };
      }

      try {
        const { data } = await authFetcher.get(`/courses/search`, {
          params: {
            q: query,
            page: pageParam,
            pageSize,
            fulltext: useFullText,
          },
        });

        if (!data.payload) {
          throw new Error('No data received');
        }

        return handleResponse(data);
      } catch (error) {
        throw new Error((error as Error).message);
      }
    },
    getNextPageParam: lastPage =>
      lastPage.pagination.currentPage < lastPage.pagination.totalPages
        ? lastPage.pagination.currentPage + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: Boolean(query.trim()), // Only run the query if there's a search term
  });

  return {
    courses: queryResult.data?.pages.flatMap(page => page.items) ?? [],
    totalItems: queryResult.data?.pages[0]?.pagination.totalItems ?? 0,
    fetchNextPage: queryResult.fetchNextPage,
    hasNextPage: queryResult.hasNextPage,
    isFetchingNextPage: queryResult.isFetchingNextPage,
    isLoading: queryResult.isPending,
    error: queryResult.error,
  };
};
