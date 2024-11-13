import api from './api';
import {CourseProgressSummary} from "@/types/progress"
import { PaginatedResponse } from '@/types/apiTypes';



export const fetchCoursesProgress = async ({user_id, page, pageSize}: {user_id: number, page: number, pageSize: number}): Promise<PaginatedResponse> => {
    const response = await api.get(`progress/courses?user_id=${user_id}&page=${page}&page_size=${pageSize}`);
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