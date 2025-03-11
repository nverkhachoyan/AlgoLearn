import { AxiosResponse } from "axios";
import { createApiClient } from "@/src/lib/api/config";
import { User } from "../../user/types/index";

const api = createApiClient();

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  errorCode?: string;
  payload?: T;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface EmailCheckResponse {
  exists: boolean;
}

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const signIn = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post("/users/sign-in", { email, password });
};

export const signUp = async (
  username: string,
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post("/users/sign-up", { username, email, password });
};

export const checkEmailExists = async (
  email: string
): Promise<AxiosResponse<ApiResponse<EmailCheckResponse>>> => {
  return api.get(`/users/check-email?email=${encodeURIComponent(email)}`);
};

export const refreshToken = async (
  refreshToken: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post("/users/refresh-token", { refreshToken });
};
