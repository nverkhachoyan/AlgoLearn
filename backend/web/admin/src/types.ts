import { RaRecord, Identifier } from "react-admin";

// Base resource interface
interface BaseResource extends RaRecord {
  createdAt: string;
  updatedAt: string;
}

// Resource-specific interfaces
export interface Course extends BaseResource {
  name: string;
  description: string;
  requirements: string;
  whatYouLearn: string;
  backgroundColor: string;
  iconUrl: string;
  duration: number;
  difficultyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  rating: number;
  authors: Author[];
  tags: Tag[];
}

export interface Unit extends BaseResource {
  courseId: Identifier;
  name: string;
  description: string;
  unitNumber: number;
}

export interface Module extends BaseResource {
  courseId: Identifier;
  unitId: Identifier;
  name: string;
  description: string;
  content: string;
  moduleNumber: number;
  type: "video" | "text" | "quiz";
}

export interface Author extends BaseResource {
  name: string;
}

export interface Tag extends BaseResource {
  name: string;
}

export interface User extends BaseResource {
  username: string;
  email: string;
  role: "admin" | "user" | "instructor";
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
}
