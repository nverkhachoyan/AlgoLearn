import axios, { AxiosError } from "axios";
import { ApiResponse } from "../../types/api";
import { tokenService } from "@/src/features/auth/services/tokenService";
import { QueryClient } from "@tanstack/react-query";
import type { AuthResponse } from "@/src/features/auth/authService";
import { router } from "expo-router";

// Create a singleton QueryClient instance
const queryClient = new QueryClient();

// Create axios instance with default config
console.debug(
  "[API Client] Initializing with base URL:",
  process.env.EXPO_PUBLIC_BACKEND_URL
);

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// List of endpoints that don't require authentication
const publicEndpoints = [
  "/users/checkemail",
  "/users/signin",
  "/users/signup",
  "/users/refresh",
];

class AuthQueue {
  private isAuthenticating: boolean = false;
  private queue: Array<() => Promise<void>> = [];
  private retryCount: number = 0;
  private readonly MAX_RETRIES: number = 3;

  private async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async handleAuth(callback: () => Promise<void>) {
    if (this.retryCount >= this.MAX_RETRIES) {
      console.log("Max retries reached, clearing auth state...");
      await this.handleAuthFailure();
      return;
    }

    if (this.isAuthenticating) {
      await this.delay(1000 * this.retryCount);
      return new Promise<void>((resolve) => {
        this.queue.push(async () => {
          await callback();
          resolve();
        });
      });
    }

    try {
      this.isAuthenticating = true;
      this.retryCount++;
      await callback();
    } finally {
      this.isAuthenticating = false;
      while (this.queue.length > 0) {
        const nextCallback = this.queue.shift();
        if (nextCallback) {
          await nextCallback();
        }
      }
    }
  }

  private async handleAuthFailure() {
    console.debug("[AuthQueue] Handling auth failure...");
    try {
      await tokenService.clearTokens();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.setQueryData(["authToken"], null);
      router.replace("/(auth)");
    } catch (err) {
      console.error("[AuthQueue] Error handling auth failure:", err);
    }
  }
}

const authQueue = new AuthQueue();

// Create a simple event emitter for auth events
class AuthEventEmitter {
  private static handler: (() => Promise<void>) | null = null;

  static setAuthFailureHandler(handler: () => Promise<void>) {
    this.handler = handler;
  }

  static async handleAuthFailure() {
    if (this.handler) {
      await this.handler();
    } else {
      console.warn("[AuthEventEmitter] No auth failure handler registered");
    }
  }
}

export { AuthEventEmitter };

// Request interceptor
api.interceptors.request.use(async (config) => {
  if (!config.headers) {
    config.headers = new axios.AxiosHeaders();
  }

  console.debug("[API Client] Request URL:", config.url);
  console.debug("[API Client] Request Method:", config.method);

  // Skip auth token for public endpoints
  if (
    config.url &&
    publicEndpoints.some((endpoint) => config.url?.includes(endpoint))
  ) {
    console.debug(
      "[API Client] Skipping auth for public endpoint:",
      config.url
    );
    // Ensure no auth header is set for public endpoints
    config.headers.delete("Authorization");
  } else {
    try {
      const token = await tokenService.getToken();
      console.debug("[API Client] Token retrieved:", token ? "exists" : "null");

      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      } else {
        config.headers.delete("Authorization");
        console.debug(
          "[API Client] No auth token found for request:",
          config.url
        );
      }
    } catch (error) {
      console.error("[API Client] Error setting auth token:", error);
      config.headers.delete("Authorization");
    }
  }

  // Log final headers (safely handle undefined Authorization)
  const headers = Object.fromEntries(
    Object.entries(config.headers).map(([key, value]) => {
      if (key.toLowerCase() === "authorization" && typeof value === "string") {
        return [key, value.substring(0, 20) + "..."];
      }
      return [key, value];
    })
  );
  console.debug("[API Client] Final headers:", headers);

  return config;
});

// Response interceptor for 401s
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const originalRequest = error.config;

    // Prevent infinite retry loop
    if (originalRequest?.url?.includes("/refresh")) {
      await AuthEventEmitter.handleAuthFailure();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest) {
      try {
        console.debug("[API Client] Attempting token refresh...");
        const refreshToken = await tokenService.getRefreshToken();

        if (!refreshToken) {
          console.debug(
            "[API Client] No refresh token, handling auth failure..."
          );
          await AuthEventEmitter.handleAuthFailure();
          throw new Error("No refresh token available");
        }

        const response = await axios.post<ApiResponse<AuthResponse>>(
          `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/refresh`,
          { refreshToken }
        );

        if (response.data.success && response.data.payload) {
          console.debug("[API Client] Token refresh successful");
          await tokenService.setToken(response.data.payload.token);
          if (response.data.payload.refreshToken) {
            await tokenService.setRefreshToken(
              response.data.payload.refreshToken
            );
          }

          originalRequest.headers.Authorization = `Bearer ${response.data.payload.token}`;
          return api.request(originalRequest);
        } else {
          throw new Error(response.data.message || "Token refresh failed");
        }
      } catch (refreshError) {
        console.error("[API Client] Token refresh failed:", refreshError);
        await AuthEventEmitter.handleAuthFailure();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(handleApiError(error));
  }
);

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

export default api;
