import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchModuleFull } from "@/src/features/module/api/queries";

export const useModules = ({
  courseId,
  unitId,
  moduleId,
  userId,
  type,
  include,
}: {
  courseId: number;
  unitId: number;
  moduleId: number;
  userId: number;
  type: string;
  include: string;
}) => {
  const queryClient = useQueryClient();

  const moduleFullQuery = useQuery({
    queryKey: [
      "module-full",
      courseId,
      unitId,
      moduleId,
      userId,
      type,
      include,
    ],
    queryFn: async () => {
      try {
        const axiosResponse = await fetchModuleFull({
          courseId,
          unitId,
          moduleId,
          userId,
          type,
          include,
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
