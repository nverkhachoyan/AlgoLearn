import api from "@/src/features/auth/setup";
import { AxiosResponse } from "axios";
import { ModuleFetchParams } from "./types";

export const fetchModules = async ({
  courseId,
  unitId,
  currentPage,
  pageSize,
}: ModuleFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(
    `/courses/${courseId}/units/${unitId}/modules`,
    {
      params: {
        currentPage,
        pageSize,
      },
    }
  );
  return response;
};

export const fetchModule = async ({
  courseId,
  unitId,
  moduleId,
}: ModuleFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}`
  );
  return response;
};

export const updateModuleProgress = async ({
  courseId,
  unitId,
  moduleId,
  moduleProgress,
}: {
  courseId: number;
  unitId: number;
  moduleId: number;
  moduleProgress: any;
}) => {
  return await api.put(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}/progress`,
    moduleProgress
  );
};
