export interface UseProgressParams {
  userId?: number;
  courseId?: number;
  page?: number;
  pageSize?: number;
  filter?: "learning" | "explore" | "all";
  type?: "summary" | "brief" | "full";
  include?: "progress";
}
