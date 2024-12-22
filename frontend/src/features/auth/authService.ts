import { AxiosResponse } from "axios";
import api from "./setup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../user/types";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  errorCode?: string;
  payload?: T;
}

export interface UserPreferences {
  theme: string;
  lang: string;
  timezone: string;
}

export interface UserResponse {
  id: number;
  createdAt: string;
  updatedAt: string;
  username: string;
  email: string;
  role: string;
  lastLoginAt: string;
  isActive: boolean;
  isEmailVerified: boolean;
  cpus: number;
  preferences: UserPreferences;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserResponse;
}

export interface EmailCheckResponse {
  exists: boolean;
}

export const checkEmailExists = async (
  email: string
): Promise<AxiosResponse<ApiResponse<EmailCheckResponse>>> => {
  console.debug("[AuthService] Checking email:", email);
  try {
    const response = await api.post<ApiResponse<EmailCheckResponse>>(
      "/users/check-email",
      { email }
    );
    console.debug("[AuthService] Email check response:", response.data);
    return response;
  } catch (error) {
    console.error("[AuthService] Email check failed:", error);
    throw error;
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post<ApiResponse<AuthResponse>>("/users/sign-in", {
    email,
    password,
  });
};

export const signUp = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post<ApiResponse<AuthResponse>>("/users/sign-up", {
    email,
    password,
  });
};

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const setAuthToken = async (token: string) => {
  try {
    await AsyncStorage.setItem("authToken", token);
  } catch (error) {
    console.error("Error setting auth token:", error);
  }
};

export const removeAuthToken = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (error) {
    console.error("Error removing auth token:", error);
  }
};

export const refreshToken = (
  refreshToken: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  return api.post("/users/refresh-token", { refreshToken });
};
