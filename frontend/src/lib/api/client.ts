import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        return "Please log in to continue";
      case 403:
        return "You don't have permission to access this";
      case 404:
        return "Resource not found";
      case 500:
        return "Server error. Please try again later";
      default:
        return error.response?.data?.message || "An unexpected error occurred";
    }
  }
  return error instanceof Error
    ? error.message
    : `An unexpected error occurred: ${error}`;
};

export default api;
