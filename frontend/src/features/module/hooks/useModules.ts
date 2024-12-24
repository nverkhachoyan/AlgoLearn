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
  const { courseId, unitId, moduleId } = props;

  const currentModule = useQuery({
    queryKey: ["module", courseId, unitId, moduleId],
    queryFn: async (): Promise<ModulePayload> => {
      const response = await fetchModule({
        courseId,
        unitId,
        moduleId,
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
        moduleId,
        moduleProgress,
      });

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["module", courseId, unitId, moduleId],
      });
    },
  });

  console.log("currentModule.data", currentModule.data);

  if (currentModule.data?.nextModuleId) {
    queryClient.prefetchQuery({
      queryKey: ["module", courseId, unitId, currentModule.data?.nextModuleId],
      queryFn: async (): Promise<ModulePayload> => {
        const response = await fetchModule({
          courseId,
          unitId,
          moduleId: currentModule.data?.nextModuleId,
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
