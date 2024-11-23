type Type = "summary" | "full";
type Filter = "learning" | "explore";

export interface ModuleFetchParams {
  userId?: number;
  courseId?: number;
  currentPage?: number;
  pageSize?: number;
  type: Type;
  filter: Filter;
}
