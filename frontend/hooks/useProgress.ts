import { fetchCourseProgress, fetchCoursesProgress } from "@/services/progressService";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { CourseProgressSummary } from "@/types/progress";
import { UseProgressParams } from "@/types/hooks";


export const useProgress = ({ user_id, course_id, page, pageSize, filter, type }: UseProgressParams) => {
  console.log('useProgress called with filter:', filter);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
  } = useInfiniteQuery({
    queryKey: ["progress", filter, type, user_id],
    queryFn: async () => {
      const res = await fetchCoursesProgress({
        user_id,
        page,
        pageSize,
        filter,
        type
      });
      console.log(`Data fetched for ${filter}:`, res);
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

  const {
    data: course,
    isPending: isCoursePending,
    error: courseError
  } = useQuery({
    queryKey: ["progress", course_id, filter, type],
    queryFn: async () => {
      const res = await fetchCourseProgress({
        user_id,
        course_id,
        filter,
        type
      });
      return res
    },
  })

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