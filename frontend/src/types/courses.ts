import { BaseModel } from "@/src/types/base";
import { DifficultyLevel } from "@/src/types/enums";
import { Unit } from "@/src/types/units";

export interface Course extends BaseModel {
  name: string;
  description: string;
  backgroundColor?: string;
  iconUrl?: string;
  duration: number;
  difficultyLevel: DifficultyLevel;
  authors: Author[];
  tags: string[];
  rating: number;
  learnersCount?: number;
  units: Unit[];
}

export interface Author {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
}
