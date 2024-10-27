import {fetchUnits} from "@/services/unitService";
import {useQuery, useQueryClient} from "@tanstack/react-query";

export const useUnits = (courseId: number) => {
    const queryClient = useQueryClient();

    const unitsQuery = useQuery({
        queryKey: ["units", courseId],
        queryFn: async () => {
            const units = await fetchUnits(courseId);
            return units;
        },
        enabled: !!courseId
    });

    return {
        units: {
            isPending: unitsQuery.isPending,
            data: unitsQuery.data,
            error: unitsQuery.error,
        },
    };
};