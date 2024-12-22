import axios from "axios";
import { Platform } from "react-native";

export const getBaseURL = () => {
  const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (!baseURL) {
    throw new Error("EXPO_PUBLIC_BACKEND_URL is not defined");
  }
  return baseURL;
};

export const createApiClient = () => {
  const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.debug("[API Client] Initializing with base URL:", getBaseURL());
  return api;
};

export const handleApiError = (error: any) => {
  if (Platform.OS === "web") {
    console.error("[API Client] Error:", error);
  }
  throw error;
};
