import { BaseModel } from "./base";
import { Section } from "@/src/types/sections";

export interface Module extends BaseModel {
  moduleNumber: number;
  moduleUnitId: number;
  name: string;
  description: string;
  sections?: Section[];
}
