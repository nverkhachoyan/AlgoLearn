import { fetchCourses } from "@/services/coursesService";
import { useQuery } from "@tanstack/react-query";

export const useCourses = () => {
  const {
    data: allCourses,
    isPending: isCoursesPending,
    error: coursesFetchError,
  } = useQuery({
    queryKey: ["allCourses"],
    queryFn: fetchCourses,
  });

  return {
    allCourses,
    isCoursesPending,
    coursesFetchError,
  };
};
