import api from "./api";
import { Response } from "@/types/apiTypes";

export const fetchUser = async (token: string): Promise<Response> => {
  const response = await api.get("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateUser = async (
  token: string,
  data: any,
): Promise<Response> => {
  const response = await api.put("/user", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const deleteAccount = async (token: string): Promise<Response> => {
  const response = await api.delete("/user", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
