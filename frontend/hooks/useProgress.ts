import {fetchCoursesProgress} from "@/services/progressService";
import {useQuery} from "@tanstack/react-query";

export const useProgress = ({user_id}: {user_id: number}) => {
  const {
    data: progress,
    isPending: isProgressPending,
    error: progressFetchError,
  } = useQuery({
    queryKey: ["progress"],
    queryFn:  async () => {
        const coursesProgress = await fetchCoursesProgress({user_id});
        return coursesProgress;
    },
  });

  return {
    progress,
    isProgressPending,
    progressFetchError,
  };
};
