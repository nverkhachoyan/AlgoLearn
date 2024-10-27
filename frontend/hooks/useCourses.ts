import {fetchCourses, fetchCoursesOutline} from "@/services/coursesService";
import {useQuery} from "@tanstack/react-query";

export const useCourses = () => {
  const {
    data: allCourses,
    isPending: isCoursesPending,
    error: coursesFetchError,
  } = useQuery({
    queryKey: ["allCourses"],
    queryFn: fetchCourses,
  });

  const {
    data: coursesOutline,
    isPending: isCoursesOutlinePending,
    error: coursesOutlineFetchError,
  } = useQuery({
    queryKey: ["coursesOutline"],
    queryFn: fetchCoursesOutline
  });

  return {
    allCourses,
    isCoursesPending,
    coursesFetchError,
    coursesOutline,
    isCoursesOutlinePending,
    coursesOutlineFetchError
  };
};
