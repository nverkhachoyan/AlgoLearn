import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchModuleFull } from "@/src/features/module/api/queries";
import { BatchModuleProgress } from "../features/module/types";
import { updateModuleProgress } from "@/src/features/module/api/queries";

export const useModules = ({
  courseId,
  unitId,
  moduleId,
  userId,
  type,
  filter,
}: {
  courseId: number;
  unitId: number;
  moduleId: number;
  userId: number;
  type: string;
  filter: string;
}) => {
  const queryClient = useQueryClient();

  const moduleFullQuery = useQuery({
    queryKey: ["module-full", courseId, unitId, moduleId, userId, type, filter],
    queryFn: async () => {
      try {
        const axiosResponse = await fetchModuleFull({
          courseId,
          unitId,
          moduleId,
          userId,
          type,
          filter,
        });
        const response = axiosResponse.data;
        if (!response.success) {
          throw new Error(response.message);
        }

        return response.payload;
      } catch (error: any) {
        throw error;
      }
    },
    enabled: !!courseId || !!unitId,
  });

  return {
    module: {
      isPending: moduleFullQuery.isPending,
      data: moduleFullQuery.data,
      error: moduleFullQuery.error,
    },
  };
};

export const useUpdateModuleProgress = (
  courseId: number,
  unitId: number,
  moduleId: number,
  userId: number
) => {
  const mutation = useMutation({
    mutationFn: async (moduleProgress: BatchModuleProgress) => {
      const res = await updateModuleProgress({
        courseId,
        unitId,
        userId,
        moduleId,
        moduleProgress,
      });

      return res;
    },
  });

  return {
    mutation,
  };
};
