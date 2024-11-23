type Type = "summary" | "brief" | "full";
type Filter = "learning" | "explore" | "all";
export interface CourseFetchParams {
  userId?: number;
  courseId?: number;
  currentPage?: number;
  pageSize?: number;
  type: Type;
  filter: Filter;
}
