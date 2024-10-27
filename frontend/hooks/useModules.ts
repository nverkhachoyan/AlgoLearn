import {useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchModuleFull} from "@/services/modulesService";

export const useModules = (courseId: number, unitId: number, moduleId: number) => {
    const queryClient = useQueryClient();

    const moduleFullQuery = useQuery({
        queryKey: ["moduleFull", courseId, unitId],
        queryFn: async () => {
            const units = await fetchModuleFull({courseId, unitId, moduleId});
            return units;
        },
        enabled: !!courseId || !!unitId
    });

    return {
        module: {
            isPending: moduleFullQuery.isPending,
            data: moduleFullQuery.data,
            error: moduleFullQuery.error,
        },
    };
};