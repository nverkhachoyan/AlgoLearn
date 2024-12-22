import { AxiosInstance } from "axios";
import { tokenService } from "../services/tokenService";
import AuthEvents from "../events/authEvents";
import { handleApiError } from "@/src/lib/api/config";

export const setupAuthInterceptors = (api: AxiosInstance) => {
  api.interceptors.request.use(
    async (config) => {
      const token = await tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.debug(
          "[API Client] Token retrieved:",
          token ? "exists" : "null"
        );
      }
      return config;
    },
    (error) => {
      console.error("[API Client] Request interceptor error:", error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await AuthEvents.handleAuthFailure(error);
      }
      return handleApiError(error);
    }
  );
};
