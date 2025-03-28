import { useMutation, useQuery, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { Module } from '../types';
import { useAuthFetcher } from '../../auth';

export type UseModuleProgressProps = {
  courseId: number;
  unitId: number;
  moduleId: number;
};

export interface ModuleProgressResponse {
  module: Module;
  nextModuleId: number | null;
  prevModuleId: number | null;
  nextUnitId: number | null;
  prevUnitId: number | null;
  nextUnitModuleId: number | null;
  prevUnitModuleId: number | null;
}

export type UseModuleProgressReturn = {
  currentModule: Module | undefined;
  completeModuleMutation: UseMutationResult<any, Error, any, unknown>;
  nextModuleId: number | undefined;
  hasNextModule: boolean | undefined;
  prevModuleId: number | undefined;
  hasPrevModule: boolean | undefined;
  nextUnitId: number | undefined;
  hasNextUnit: boolean | undefined;
  prevUnitId: number | undefined;
  hasPrevUnit: boolean | undefined;
  nextUnitModuleId: number | undefined;
  hasNextUnitModule: boolean | undefined;
  prevUnitModuleId: number | undefined;
  hasPrevUnitModule: boolean | undefined;
  isPending: boolean;
  error: Error | null;
  isModuleFetching: boolean;
};

export const useModuleProgress = (props: UseModuleProgressProps): UseModuleProgressReturn => {
  const queryClient = useQueryClient();
  const authFetcher = useAuthFetcher();
  const { courseId, unitId, moduleId } = props;

  const currentModule = useQuery({
    queryKey: ['module', courseId, unitId, moduleId],
    queryFn: async (): Promise<ModuleProgressResponse> => {
      const response = await authFetcher.get(
        `/courses/${courseId}/units/${unitId}/modules/${moduleId}`
      );

      const axiosResponse = response.data;
      const payload = axiosResponse.payload;

      return payload;
    },
    enabled: !!moduleId,
  });

  const completeModuleMutation = useMutation({
    mutationKey: ['complete-module'],
    mutationFn: async (moduleProgress: any) => {
      const res = await authFetcher.put(
        `/courses/${courseId}/units/${unitId}/modules/${moduleId}/progress`,
        moduleProgress
      );

      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['module', courseId, unitId, moduleId],
      });

      queryClient.invalidateQueries({
        queryKey: ['course', courseId, 'progress'],
      });

      queryClient.invalidateQueries({
        queryKey: ['courses', 'progress'],
      });
    },
  });

  if (currentModule.data?.nextModuleId) {
    queryClient.prefetchQuery({
      queryKey: ['module', courseId, unitId, currentModule.data?.nextModuleId],
      queryFn: async (): Promise<ModuleProgressResponse> => {
        const response = await authFetcher.get(
          `/courses/${courseId}/units/${unitId}/modules/${currentModule.data?.nextModuleId || 0}`
        );

        const axiosResponse = response.data;
        const payload = axiosResponse.payload;

        return payload;
      },
    });
  }

  return {
    currentModule: currentModule?.data?.module || undefined,
    completeModuleMutation,
    nextModuleId: currentModule?.data?.nextModuleId || undefined,
    hasNextModule: currentModule?.data?.nextModuleId !== null,
    prevModuleId: currentModule?.data?.prevModuleId || undefined,
    hasPrevModule: currentModule?.data?.prevModuleId !== null,
    nextUnitId: currentModule?.data?.nextUnitId || undefined,
    hasNextUnit: currentModule?.data?.nextUnitId !== null,
    prevUnitId: currentModule?.data?.prevUnitId || undefined,
    hasPrevUnit: currentModule?.data?.prevUnitId !== null,
    nextUnitModuleId: currentModule?.data?.nextUnitModuleId || undefined,
    hasNextUnitModule: currentModule?.data?.nextUnitModuleId !== null,
    prevUnitModuleId: currentModule?.data?.prevUnitModuleId || undefined,
    hasPrevUnitModule: currentModule?.data?.prevUnitModuleId !== null,
    isPending: currentModule.isPending,
    error: currentModule.error,
    isModuleFetching: currentModule.isFetching,
  };
};
