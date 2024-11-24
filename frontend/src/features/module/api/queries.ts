import api from "@/src/lib/api/client";
import { AxiosResponse } from "axios";
import { BatchModuleProgress } from "../types";

export const fetchModulesFull = async (): Promise<AxiosResponse> => {
  return await api.get("/courses");
};

export const fetchModuleFull = async ({
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
}): Promise<AxiosResponse> => {
  return await api.get(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}`,
    {
      params: {
        userId,
        type,
        filter,
      },
    }
  );
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
  moduleProgress: BatchModuleProgress;
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
