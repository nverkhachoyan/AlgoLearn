import {
  fetchCourseProgress,
  fetchCoursesProgress,
} from "@/src/features/progress/progressService";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CourseProgressSummary } from "@/src/types/progress";
import { UseProgressParams } from "@/src/types/hooks";

export const useProgress = ({
  userId,
  courseId,
  page,
  pageSize,
  filter,
  type,
}: UseProgressParams) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["progress", filter, type, userId],
    queryFn: async () => {
      const res = await fetchCoursesProgress({
        userId,
        page,
        pageSize,
        filter,
        type,
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  const {
    data: course,
    isPending: isCoursePending,
    error: courseError,
  } = useQuery({
    queryKey: ["progress", courseId, filter, type],
    queryFn: async () => {
      const res = await fetchCourseProgress({
        userId,
        courseId,
        filter,
        type,
      });
      return res;
    },
  });

  // flatten all pages into a single array of items
  const courses = data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = data?.pages[0]?.total ?? 0;

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
