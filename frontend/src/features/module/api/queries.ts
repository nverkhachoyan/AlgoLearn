import api from "@/src/lib/api/client";
import { Module } from "@/src/types/modules";

export const fetchModulesFull = async (): Promise<Module[]> => {
  const response = await api.get("/courses");
  return response.data.data;
};

export const fetchModuleFull = async ({
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
}): Promise<Module> => {
  const response = await api.get(
    `/courses/${courseId}/units/${unitId}/modules/${moduleId}?user_id=${userId}&type=${type}&include=${include}`
  );
  return response.data.data;
};
