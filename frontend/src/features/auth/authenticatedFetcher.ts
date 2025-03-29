import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { tokenService } from './tokenService';
import { getBaseURL } from './utils';
import { QueryClient } from '@tanstack/react-query';

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  errorCode?: string;
  payload?: T;
}

export class AuthenticatedFetcher {
  private api: AxiosInstance;
  private queryClient: QueryClient;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private onLogout: () => Promise<void>;

  constructor(queryClient: QueryClient, onLogout: () => Promise<void>) {
    this.queryClient = queryClient;
    this.onLogout = onLogout;

    this.api = axios.create({
      baseURL: getBaseURL(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async config => {
        const token = await tokenService.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      response => response,
      async (error: AxiosError<ApiResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Check if the error is due to token expiration
        const errorCode = error.response?.data?.errorCode;
        const status = error.response?.status;

        if ((errorCode === 'TOKEN_EXPIRED' || status === 401) && !originalRequest._retry) {
          // If already refreshing, wait for the refresh to complete and retry
          if (this.isRefreshing) {
            try {
              await this.refreshPromise;
              originalRequest._retry = true;
              return this.api(originalRequest);
            } catch (e) {
              return Promise.reject(error);
            }
          }

          // Start refresh process
          this.isRefreshing = true;
          this.refreshPromise = this.refreshToken();

          try {
            const newToken = await this.refreshPromise;
            this.isRefreshing = false;
            this.refreshPromise = null;

            if (newToken) {
              originalRequest._retry = true;
              return this.api(originalRequest);
            } else {
              await this.onLogout();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshPromise = null;
            await this.onLogout();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = await tokenService.getRefreshToken();

      if (!refreshToken) {
        console.debug('[AuthFetcher] No refresh token available');
        await this.onLogout();
        return null;
      }

      const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${getBaseURL()}/users/refresh-token`,
        { refreshToken }
      );

      if (!response.data.success || !response.data.payload) {
        console.debug('[AuthFetcher] Token refresh failed', response.data);
        await this.onLogout();
        return null;
      }

      const { token, refreshToken: newRefreshToken } = response.data.payload;

      await tokenService.setToken(token);
      await tokenService.setRefreshToken(newRefreshToken);

      // Update auth state
      this.queryClient.setQueryData(['auth', 'token'], token);

      console.debug('[AuthFetcher] Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('[AuthFetcher] Error refreshing token:', error);
      await this.onLogout();
      return null;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.get<T>(url, config);
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.post<T>(url, data, config);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.put<T>(url, data, config);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.api.delete<T>(url, config);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.api.patch<T>(url, data, config);
  }

  getAxiosInstance() {
    return this.api;
  }
}
