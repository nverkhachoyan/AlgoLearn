import api from "@/services/api"
import {Unit} from "@/types/units"

export const fetchUnits = async (courseId: number): Promise<Unit | null> => {
    try {
        const response = await api.get(`/courses/${courseId}/units`);
        console.log("UNITS", response.data.data)
        return response.data.data;
    } catch (e) {
        console.error(`failed to fetch units: ${e}`)
    }
    return null
}