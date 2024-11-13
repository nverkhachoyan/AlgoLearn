import api from './api';
import {CourseProgress} from "@/types/progress"

export const fetchCoursesProgress = async ({user_id}: {user_id: number}): Promise<CourseProgress[]> => {
    const response = await api.get(`progress?user_id=${user_id}`);
    return response.data.data;
};

// export const fetchModuleFull = async ({courseId, unitId, moduleId}: {
//     courseId: number,
//     unitId: number,
//     moduleId: number
// }): Promise<CourseProgress> => {
//     const response = await api.get(`/courses/${courseId}/units/${unitId}/modules/${moduleId}`);
//     return response.data.data;
// };