import {BaseModel} from "@/types/base";
import {DifficultyLevel} from "@/types/enums";
import {Unit} from "@/types/units"

export interface Course extends BaseModel {
    name: string
    description: string
    background_color?: string
    icon_url?: string
    duration: number
    difficulty_level: DifficultyLevel
    authors: Author[]
    tags: string[]
    rating: number
    learners_count?: number
    units: Unit[]
}

export interface Author {
    id: number
    name: string
}

export interface Tag {
    id: number
    name: string
}