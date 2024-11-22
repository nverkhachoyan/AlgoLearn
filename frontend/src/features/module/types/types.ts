import { BaseModel } from "@/src/types";
import { Section } from "@/src/features/module/types/sections";

export interface Module extends BaseModel {
  moduleNumber: number;
  moduleUnitId: number;
  name: string;
  description: string;
  sections?: Section[];
}
