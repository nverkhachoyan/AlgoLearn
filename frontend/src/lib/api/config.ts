import axios from "axios";

// Create axios instance with default config
console.debug(
  "[API Client] Initializing with base URL:",
  process.env.EXPO_PUBLIC_BACKEND_URL
);

export const createApiClient = () => {
  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 10000,
  });

  return api;
};

export const handleApiError = (error: unknown): string => {
  console.error("[API Client] Error details:", {
    isAxiosError: axios.isAxiosError(error),
    status: axios.isAxiosError(error) ? error.response?.status : undefined,
    message: error instanceof Error ? error.message : String(error),
    response: axios.isAxiosError(error) ? error.response?.data : undefined,
    url: axios.isAxiosError(error) ? error.config?.url : undefined,
    method: axios.isAxiosError(error) ? error.config?.method : undefined,
  });

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      console.error("[API Client] Network error:", error.message);
      return "Network error. Please check your connection";
    }

    const errorMessage =
      error.response.data?.message || "An unexpected error occurred";
    console.error(`[API Client] ${error.response.status} error:`, errorMessage);

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
        return errorMessage;
    }
  }

  return error instanceof Error
    ? error.message
    : `An unexpected error occurred: ${error}`;
};
