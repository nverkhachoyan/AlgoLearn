import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { fetchModule, fetchModules } from "@/src/features/module/api/queries";
import { ModuleResponse } from "@/src/features/module/api/types";
import { updateModuleProgress } from "@/src/features/module/api/queries";
import {
  ModuleFetchParams,
  Type,
  Filter,
} from "@/src/features/module/api/types";
import { Module } from "../features/module/types";
import { useState } from "react";

// interface UseModulesParams {
//   courseId: number;
//   unitId: number;
//   moduleId?: number;
//   userId: number;
//   type: Type;
//   filter: Filter;
//   pageSize?: number;
//   includeNextModule?: boolean;
// }

// export const useModules = ({
//   courseId,
//   unitId,
//   moduleId,
//   userId,
//   type,
//   filter,
//   pageSize = 10,
//   includeNextModule = false,
// }: UseModulesParams) => {
//   const queryClient = useQueryClient();

//   const [modules, setModules] = useState<Module[]>([]);
//   // For paginated modules fetch
//   const modulesQuery = useInfiniteQuery({
//     queryKey: ["modules", courseId, unitId, userId, type, filter],
//     queryFn: async ({ pageParam = 1 }) => {
//       const response = await fetchModules({
//         courseId,
//         unitId,
//         userId,
//         currentPage: pageParam,
//         pageSize,
//         type,
//         filter,
//       });

//       if (pageParam === 1) {
//         setModules(response.data.payload.items[0]);
//       } else {
//         setModules((prev) => [...prev, ...response.data.payload.items[0]]);
//       }

//       return response.data as ModuleResponse;
//     },
//     initialPageParam: 1,
//     getNextPageParam: (lastPage) => {
//       const { currentPage, totalPages } = lastPage.payload.pagination;
//       return currentPage < totalPages ? currentPage + 1 : undefined;
//     },
//   });

//   // Get the next module if available
//   const currentModule = modules[0];

//   return {
//     modules: {
//       data: currentModule,
//       hasNextPage: modulesQuery.hasNextPage,
//       isFetchingNextPage: modulesQuery.isFetchingNextPage,
//       fetchNextPage: modulesQuery.fetchNextPage,
//       isPending: modulesQuery.isPending,
//       error: modulesQuery.error,
//     },
//   };
// };

// export const useModule = ({
//   courseId,
//   unitId,
//   moduleId,
//   userId,
//   type,
//   filter,
// }: UseModulesParams) => {
//   const moduleQuery = useQuery({
//     queryKey: ["module", courseId, unitId, moduleId, userId, type, filter],
//     queryFn: async () => {
//       const response = await fetchModule({
//         courseId,
//         unitId,
//         moduleId,
//         userId,
//         type,
//         filter,
//       });
//       return response.data.payload;
//     },
//     enabled: !!moduleId,
//   });

//   return {
//     module: {
//       data: moduleQuery.data,
//       isPending: moduleQuery.isPending,
//       error: moduleQuery.error,
//     },
//   };
// };

// export const useUpdateModuleProgress = (
//   courseId: number,
//   unitId: number,
//   moduleId: number,
//   userId: number
// ) => {
//   const mutation = useMutation({
//     mutationFn: async (moduleProgress: any) => {
//       const res = await updateModuleProgress({
//         courseId,
//         unitId,
//         userId,
//         moduleId,
//         moduleProgress,
//       });

//       return res;
//     },
//   });

//   return {
//     mutation,
//   };
// };

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
  props: UseModuleProgressProps,
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
