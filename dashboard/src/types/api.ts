import { Module } from "./models";

export interface ApiResponse<T> {
  success: boolean;
  payload: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  payload: T[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}

export interface ModuleResponse {
  module: Module;
  nextModuleId: number;
  prevModuleId: number;
  nextUnitId: number;
  prevUnitId: number;
  nextUnitModuleId: number;
  prevUnitModuleId: number;
}
