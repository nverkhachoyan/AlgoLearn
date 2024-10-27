import {BaseModel} from "./base"
import { Section } from "@/types/sections";


export interface Module extends BaseModel {
    unit_id: number;
    name: string;
    description: string;
    sections?: Section[];
}