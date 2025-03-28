import axios from 'axios';
import { User } from '@/src/features/user/types';

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

  console.debug('[API Client] Initializing with base URL:', getBaseURL());
  return api;
};

const api = createApiClient();
export default api;

export { AuthenticatedFetcher } from './authenticatedFetcher';
export { useAuthFetcher } from './useAuthFetcher';
