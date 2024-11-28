import { Module } from "@/src/features/module/types";

export type Type = "summary" | "brief" | "full";
export type Filter = "learning" | "explore" | "all";

export interface ModuleFetchParams {
  userId?: number;
  courseId?: number;
  unitId?: number;
  moduleId?: number;
  currentPage?: number;
  pageSize?: number;
  type: Type;
  filter: Filter;
}

export interface ModuleResponse {
  success: boolean;
  message: string;
  payload: {
    items: Module[];
    pagination: {
      totalItems: number;
      pageSize: number;
      currentPage: number;
      totalPages: number;
    };
  };
}
