import api from './api';
import {Module} from "@/types/modules"

export const fetchModulesFull = async (): Promise<Module[]> => {
    const response = await api.get('/courses');
    return response.data.data;
};

export const fetchModuleFull = async ({courseId, unitId, moduleId}: {
    courseId: number,
    unitId: number,
    moduleId: number
}): Promise<Module> => {
    const response = await api.get(`/courses/${courseId}/units/${unitId}/modules/${moduleId}`);
    return response.data.data;
};