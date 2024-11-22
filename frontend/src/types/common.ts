export interface BaseModel {
  id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ImageFile = {
  uri: string;
  name?: string;
  type: string;
} | null;

export enum DifficultyLevel {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
  Expert = "expert",
}
