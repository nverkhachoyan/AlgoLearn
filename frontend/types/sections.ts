import { BaseModel } from "./base";
import { DifficultyLevel } from "./enums";

export interface BaseSection {
    module_id?: number;
    type: 'text' | 'video' | 'question' | 'code';
    position: number;
}

export interface TextSection extends BaseModel, BaseSection {
    type: 'text';
    content: string;
}

export interface VideoSection extends BaseModel, BaseSection {
    type: 'video';
    url: string;
}

export interface CodeSection extends BaseSection {
    type: "code";
    content: string;
}

export interface QuestionOption {
    id: number;
    question_id: number;
    content: string;
    is_correct: boolean;
}

export interface Question extends BaseModel {
    type: string;
    question: string;
    difficulty_level: DifficultyLevel;
    options: QuestionOption[];
}

export interface QuestionSection extends BaseModel, BaseSection {
    type: 'question';
    question_id: number;
    question: Question;
}

export type Section = TextSection | VideoSection | QuestionSection;