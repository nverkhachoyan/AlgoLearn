import { AxiosError, AxiosInstance, AxiosHeaders } from "axios";
import { tokenService } from "../services/tokenService";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { router } from "expo-router";
import { refreshToken } from "../authService";
import type { ApiResponse, AuthResponse } from "../authService";
import AuthEvents from "../events/authEvents";

// List of endpoints that don't require authentication
const publicEndpoints = [
  "/users/check-email",
  "/users/sign-in",
  "/users/sign-up",
  "/users/refresh-token",
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

  async handleAuthFailure() {
    console.debug("[AuthQueue] Handling auth failure...");
    try {
      await AuthEvents.handleAuthFailure();
    } catch (err) {
      console.error("[AuthQueue] Error handling auth failure:", err);
      // Fallback handling if the event handler fails
      await tokenService.clearTokens();
      queryClient.removeQueries({ queryKey: ["user"] });
      queryClient.setQueryData(["authToken"], null);
      router.replace("/(auth)");
    }
  }
}

const authQueue = new AuthQueue();

export const setupAuthInterceptors = (api: AxiosInstance) => {
  // Request interceptor
  api.interceptors.request.use(async (config) => {
    if (!config.headers) {
      config.headers = new AxiosHeaders();
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
      delete config.headers.Authorization;
      return config;
    }

    try {
      const token = await tokenService.getToken();
      console.debug("[API Client] Token retrieved:", token ? "exists" : "null");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
        console.debug(
          "[API Client] No auth token found for request:",
          config.url
        );
      }
    } catch (error) {
      console.error("[API Client] Error setting auth token:", error);
      delete config.headers.Authorization;
    }

    return config;
  });

  // Response interceptor for 401s
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiResponse<unknown>>) => {
      const originalRequest = error.config;

      // Prevent infinite retry loop
      if (originalRequest?.url?.includes("/refresh-token")) {
        await authQueue.handleAuthFailure();
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && originalRequest) {
        try {
          console.debug("[API Client] Attempting token refresh...");
          const currentRefreshToken = await tokenService.getRefreshToken();

          if (!currentRefreshToken) {
            console.debug(
              "[API Client] No refresh token, handling auth failure..."
            );
            await authQueue.handleAuthFailure();
            throw new Error("No refresh token available");
          }

          const response = await refreshToken(currentRefreshToken);
          const { token, refreshToken: newRefreshToken } = response.data
            .payload as AuthResponse;

          console.debug("[API Client] Token refresh successful");
          await tokenService.setToken(token);
          if (newRefreshToken) {
            await tokenService.setRefreshToken(newRefreshToken);
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api.request(originalRequest);
        } catch (refreshError) {
          console.error("[API Client] Token refresh failed:", refreshError);
          await authQueue.handleAuthFailure();
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    }
  );
};
