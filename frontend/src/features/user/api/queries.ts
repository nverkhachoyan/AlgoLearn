import api from "@/src/features/auth/setup";
import axios, { AxiosError } from "axios";
import { AxiosResponse } from "axios";
import AuthEvents from "@/src/features/auth/events/authEvents";

const apiWithForm = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const fetchUser = async (token: string): Promise<AxiosResponse> => {
  if (!token) {
    throw new Error("No token provided");
  }

  try {
    const response = await api.get("/users/me");
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      const errorCode = error.response?.data?.errorCode;
      if (errorCode === "ACCOUNT_NOT_FOUND" || errorCode === "UNAUTHORIZED") {
        console.debug("[User API] Auth error:", errorCode);
        await AuthEvents.handleAuthFailure(error);
      }
    }
    throw error;
  }
};

export const updateUser = async (
  token: string,
  data: any
): Promise<any> => {
  try {
    const response: Response = await fetch(
      process.env.EXPO_PUBLIC_BACKEND_URL + "/users/me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(data),
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
}

export const deleteAccount = async (token: string): Promise<AxiosResponse> => {
  const response = await api.delete("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
