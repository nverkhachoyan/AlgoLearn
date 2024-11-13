import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";
import { Module } from "./modules";
import { BaseSection, QuestionOption } from "./sections";

type Status = "uninitiated" | "in_progress" | "completed" | "abandoned"


export interface CourseProgress extends BaseModel {
    user_id: number
    course_id: number
    current_unit_id: number
    current_module_id: number
    latest_module_id: number
    current_module_progress: ModuleProgress
    current_module: Module 
    sections: CurrentSection[]
}


export interface ModuleProgress extends BaseModel {
    user_id: number
    module_id: number
    started_at: Date
    completed_at: Date
    progress: number
    current_section_id: number
    last_accessed: Date
    status: Status
}

export interface CurrentSection extends BaseModel, BaseSection {
    content: string
    url: string
    question_id: number
    question: string
    difficulty_level: DifficultyLevel
    options: QuestionOption[]
}