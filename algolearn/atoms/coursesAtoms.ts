import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { Course } from "@/types/userTypes";
import { fetchCourses } from "@/services/coursesService";

export const triggerCoursesRefetchAtom = atom(false);

export const coursesAtom = atomWithQuery<Course[]>((get) => ({
  queryKey: ["courses"],
  queryFn: async () => {
    return fetchCourses();
  },
  enabled: !!get(triggerCoursesRefetchAtom),
  initialData: [],
}));
