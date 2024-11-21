import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";
import { Author, Tag } from "./courses";

type Status = "uninitiated" | "in_progress" | "completed" | "abandoned";

export interface CourseProgressSummary extends BaseModel {
  name: string;
  description: string;
  requirements: string;
  whatYouLearn: string;
  backgroundColor: string;
  iconUrl: string;
  duration: number;
  difficultyLevel: DifficultyLevel;
  authors: Author[];
  tags: Tag[];
  rating: number;
  currentUnit: UnitProgressSummary;
  currentModule: ModuleProgressSummary;
  units: UnitProgressSummary[];
}

export interface UnitProgressSummary extends BaseModel {
  unitNumber: number;
  name: string;
  description: string;
  modules: ModuleProgressSummary[];
}

export interface ModuleProgressSummary extends BaseModel {
  moduleNumber: number;
  moduleUnitId: number;
  name: string;
  description: string;
}
