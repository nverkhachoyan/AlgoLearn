import { User } from '@/src/features/user/types';
import axios from 'axios';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  errorCode?: string;
  payload?: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message?: string;
  errorCode?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface EmailCheckResponse {
  exists: boolean;
}

export const getBaseURL = () => {
  const baseURL = process.env.EXPO_PUBLIC_BACKEND_URL;
  if (!baseURL) {
    throw new Error('EXPO_PUBLIC_BACKEND_URL is not defined');
  }
  return baseURL;
};

export const createApiClient = () => {
  const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return api;
};

export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isPasswordValid = (password: string): { msg: string; isValid: boolean } => {
  if (password.length < 8) {
    return { msg: 'Password must be at least 8 characters long', isValid: false };
  }
  if (!/[A-Z]/.test(password)) {
    return { msg: 'Password must contain at least one uppercase letter', isValid: false };
  }
  if (!/[a-z]/.test(password)) {
    return { msg: 'Password must contain at least one lowercase letter', isValid: false };
  }
  if (!/[0-9]/.test(password)) {
    return { msg: 'Password must contain at least one number', isValid: false };
  }
  return { msg: '', isValid: true };
};

export const api = createApiClient();
