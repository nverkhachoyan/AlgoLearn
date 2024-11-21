import { BaseModel } from "@/src/types/base";
import { Module } from "@/src/types/modules";

export interface Unit extends BaseModel {
  unitNumber: number;
  name: string;
  description: string;
  modules: Module[];
}
