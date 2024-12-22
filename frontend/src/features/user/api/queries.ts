import api from "@/src/features/auth/setup";
import axios from "axios";
import { AxiosResponse } from "axios";

const apiWithForm = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const fetchUser = async (token: string): Promise<AxiosResponse> => {
  const response = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};

export const updateUser = async (
  token: string,
  data: any
): Promise<AxiosResponse> => {
  console.log("updateUser function called");

  const formData = new FormData();
  formData.append("data", JSON.stringify(data));
  if (data.avatar) {
    console.log("Avatar is present");
    formData.append("avatar", data.avatar);
  }

  try {
    const response: any = await fetch(
      process.env.EXPO_PUBLIC_BACKEND_URL + "/users/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response from server:", errorData);
      throw new Error("Network response was not ok");
    }

    const responseData = await response.json();
    return responseData;
  } catch (error: any) {
    throw error;
  }
};

export const deleteAccount = async (token: string): Promise<AxiosResponse> => {
  const response = await api.delete("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
