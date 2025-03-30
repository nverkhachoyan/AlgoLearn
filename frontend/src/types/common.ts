export interface BaseModel {
  id: number;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type ImageFile = {
  uri: string;
  name: string;
  ext: string;
  contentType: string;
  size: number; // file size in bytes
  file?: File; // web only
} | null;

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
  Expert = 'expert',
}
