import api from "@/src/lib/api/client";
import { AxiosResponse } from "axios";
import { ModuleFetchParams } from "./types";

export const fetchModules = async ({
  userId,
  courseId,
  unitId,
  currentPage,
  pageSize,
  filter,
  type,
}: ModuleFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(
    `/courses/${courseId}/units/${unitId}/modules`,
    {
      params: {
        userId,
        currentPage,
        pageSize,
        filter,
        type,
      },
    }
  );
  return response;
};

export const fetchModule = async ({
  userId,
  courseId,
  unitId,
  moduleId,
  type,
  filter,
}: ModuleFetchParams): Promise<AxiosResponse> => {
  const response = await api.get(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
    {
      params: {
        userId,
        type,
        filter,
      },
    }
  );
  return response;
};

export const updateModuleProgress = async ({
  courseId,
  unitId,
  moduleId,
  userId,
  moduleProgress,
}: {
  courseId: number;
  unitId: number;
  moduleId: number;
  userId: number;
  moduleProgress: any;
}) => {
  return await api.post(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}/progress`,
    moduleProgress,
    {
      params: {
        userId,
      },
    }
  );
};
