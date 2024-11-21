import { BaseModel } from "@/src/types/base";
import { Module } from "@/src/types/modules";

export interface Unit extends BaseModel {
  unit_number: number;
  course_id: number;
  name: string;
  description: string;
  modules: Module[];
}
