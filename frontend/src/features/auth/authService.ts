import { AxiosResponse } from "axios";
import api from "../../lib/api/client";
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
  user: UserResponse;
}

export const checkEmailExists = async (
  email: string
): Promise<AxiosResponse<ApiResponse<void>>> => {
  const response = await api.get<ApiResponse<void>>(`/users/checkemail`, {
    params: { email },
  });
  return response;
};

export const signIn = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  const response = await api.post<ApiResponse<AuthResponse>>("/users/login", {
    email,
    password,
  });
  return response;
};

export const signUp = async (
  email: string,
  password: string
): Promise<AxiosResponse<ApiResponse<AuthResponse>>> => {
  const response = await api.post<ApiResponse<AuthResponse>>(
    "/users/register",
    {
      username: email,
      email,
      password,
    }
  );
  return response;
};

export const getAuthToken = async (): Promise<string> => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("No token available");
  return token;
};
