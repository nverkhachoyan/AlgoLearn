import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../types/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Add reasonable timeout
  timeout: 10000,
});

// Add response interceptor to handle common response structure
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    // Add custom error handling
    const customError = handleApiError(error);
    return Promise.reject(customError);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Check for network errors first
    if (!error.response) {
      return "Network error. Please check your connection";
    }

    // Handle specific status codes
    switch (error.response.status) {
      case 401:
        return "Please log in to continue";
      case 403:
        return "You don't have permission to access this";
      case 404:
        return "Resource not found";
      case 429:
        return "Too many requests. Please try again later";
      case 500:
      case 502:
      case 503:
        return "Server error. Please try again later";
      default:
        // Use typed error response
        return (error as AxiosError<ApiResponse<unknown>>).response?.data?.message 
          || "An unexpected error occurred";
    }
  }
  
  return error instanceof Error
    ? error.message
    : `An unexpected error occurred: ${error}`;
};

export default api;
