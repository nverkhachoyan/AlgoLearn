import { fetchCoursesProgress } from "@/services/progressService";
import { useInfiniteQuery } from "@tanstack/react-query";
import { CourseProgressSummary } from "@/types/progress";

interface ProgressParams {
  user_id: number;
  pageSize: number;
}

export const useProgress = ({ user_id, pageSize }: ProgressParams) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["progress", user_id],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetchCoursesProgress({
        user_id,
        page: pageParam,
        pageSize,
      });
      return res;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  // flatten all pages into a single array of items
  const courses = data?.pages.flatMap((page) => page.items) ?? [];
  const totalItems = data?.pages[0]?.total ?? 0;

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