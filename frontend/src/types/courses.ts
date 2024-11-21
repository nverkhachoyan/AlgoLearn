import { BaseModel } from "@/src/types/base";
import { DifficultyLevel } from "@/src/types/enums";
import { Unit } from "./units";
import { Module } from "./modules";

type Status = "uninitiated" | "in_progress" | "completed" | "abandoned";

export interface Author {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface Course extends BaseModel {
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
  currentUnit: Unit;
  currentModule: Module;
  units: Unit[];
}
