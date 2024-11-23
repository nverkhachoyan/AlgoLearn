import api from "@/src/lib/api/client";
import { AxiosResponse } from "axios";

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
