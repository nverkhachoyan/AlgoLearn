export interface CourseFetchParams {
  userId?: number;
  courseId?: number;
  currentPage?: number;
  pageSize?: number;
  filter?: "learning" | "explore" | "all";
  type?: "summary" | "brief" | "full";
  include?: "progress";
}
