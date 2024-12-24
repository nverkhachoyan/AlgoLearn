import { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { tokenService } from "../services/tokenService";
import * as authService from "../services/authService";
import AuthEvents from "../events/authEvents";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupAuthInterceptors = (api: AxiosInstance) => {
  api.interceptors.request.use(
    async (config) => {
      const token = await tokenService.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest: any = error.config;

      // Prevent infinite retry loop
      if (originalRequest?._retry) {
        return Promise.reject(error);
      }

      const isUnauthorized = error.response?.status === 401;
      const errorCode = (error.response?.data as any)?.errorCode;

      if (isUnauthorized && !originalRequest?._retry) {
        if (isRefreshing) {
          try {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(() => {
              return api(originalRequest);
            });
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = await tokenService.getRefreshToken();
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          const response = await authService.refreshToken(refreshToken);
          const { token: newToken, refreshToken: newRefreshToken } =
            response.data.payload!;

          // Store new tokens
          await tokenService.setToken(newToken);
          await tokenService.setRefreshToken(newRefreshToken);

          // Update Authorization header
          api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

          processQueue(null, newToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(error, null);
          AuthEvents.emit("authFailure", error);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // If it's an auth-related error, emit the auth failure event
      if (
        isUnauthorized ||
        errorCode === "UNAUTHORIZED" ||
        errorCode === "ACCOUNT_NOT_FOUND"
      ) {
        AuthEvents.emit("authFailure", error);
      }

      return Promise.reject(error);
    }
  );
};
