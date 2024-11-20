import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";
import { Author, Tag } from "./courses";

type Status = "uninitiated" | "in_progress" | "completed" | "abandoned"


export interface CourseProgressSummary extends BaseModel {
    name: string
    description: string
    requirements: string
    what_you_learn: string
    background_color: string
    icon_url: string
    duration: number
    difficulty_level: DifficultyLevel
    authors: Author[]
    tags: Tag[]
    rating: number
    current_unit: UnitProgressSummary
    current_module: ModuleProgressSummary
}

export interface UnitProgressSummary extends BaseModel {
    unit_number: number
    name: string
    description: string
}


export interface ModuleProgressSummary extends BaseModel {
    module_number: number
    module_unit_id: number
    name: string
    description: string
}