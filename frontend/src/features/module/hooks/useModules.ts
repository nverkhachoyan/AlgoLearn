import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { fetchModule } from "@/src/features/module/api/queries";
import { updateModuleProgress } from "@/src/features/module/api/queries";
import { Module } from "../types";

type ModulePayload =
  | {
      module: Module;
      nextModuleId: number;
      hasNextModule: boolean;
    }
  | undefined;

export type UseModuleProgressProps = {
  courseId: number;
  unitId: number;
  moduleId: number;
  userId: number;
};

type UseModuleProgressReturn = {
  currentModule: ModulePayload;
  completeModuleMutation: UseMutationResult<any, Error, any, unknown>;
  nextModuleId: number | undefined;
  hasNextModule: boolean | undefined;
  isPending: boolean;
  error: Error | null;
  isModuleFetching: boolean;
};

export const useModuleProgress = (
  props: UseModuleProgressProps
): UseModuleProgressReturn => {
  const queryClient = useQueryClient();
  const { courseId, unitId, moduleId, userId } = props;

  const currentModule = useQuery({
    queryKey: [
      "module",
      courseId,
      unitId,
      moduleId,
      userId,
      "full",
      "learning",
    ],
    queryFn: async (): Promise<ModulePayload> => {
      const response = await fetchModule({
        courseId,
        unitId,
        moduleId,
        userId,
        type: "full",
        filter: "learning",
      });

      const axiosResponse = response.data;
      const payload = axiosResponse.payload;

      return payload;
    },
    enabled: !!moduleId,
  });

  const completeModuleMutation = useMutation({
    mutationKey: ["complete-module"],
    mutationFn: async (moduleProgress: any) => {
      const res = await updateModuleProgress({
        courseId,
        unitId,
        userId,
        moduleId,
        moduleProgress,
      });

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          "module",
          courseId,
          unitId,
          moduleId,
          userId,
          "full",
          "learning",
        ],
      });
    },
  });

  if (currentModule.data?.nextModuleId) {
    queryClient.prefetchQuery({
      queryKey: [
        "module",
        courseId,
        unitId,
        currentModule.data?.nextModuleId,
        userId,
        "full",
        "learning",
      ],
      queryFn: async (): Promise<ModulePayload> => {
        const response = await fetchModule({
          courseId,
          unitId,
          moduleId: currentModule.data?.nextModuleId,
          userId,
          type: "full",
          filter: "learning",
        });
        const axiosResponse = response.data;
        const payload = axiosResponse.payload;

        return payload;
      },
    });
  }

  return {
    currentModule: currentModule?.data,
    completeModuleMutation,
    nextModuleId: currentModule?.data?.nextModuleId,
    hasNextModule: currentModule?.data?.hasNextModule,
    isPending: currentModule.isPending,
    error: currentModule.error,
    isModuleFetching: currentModule.isFetching,
  };
};
