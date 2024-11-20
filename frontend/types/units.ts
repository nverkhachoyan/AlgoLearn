import {BaseModel} from "@/types/base";
import {Module} from "@/types/modules"

export interface Unit extends BaseModel {
    unit_number: number
    course_id: number
    name: string
    description: string
    modules: Module[]
}