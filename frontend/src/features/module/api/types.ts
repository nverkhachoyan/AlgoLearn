import { Module } from "@/src/features/module/types";

export interface ModuleFetchParams {
  courseId?: number;
  unitId?: number;
  moduleId?: number;
  currentPage?: number;
  pageSize?: number;
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

export interface ModuleProgressResponse {
  module: Module;
  nextModuleId: number | null;
  prevModuleId: number | null;
  nextUnitId: number | null;
  prevUnitId: number | null;
  nextUnitModuleId: number | null;
  prevUnitModuleId: number | null;
}
