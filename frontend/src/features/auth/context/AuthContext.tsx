import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { tokenService } from "../services/tokenService";
import * as authService from "../authService";
import type {
  ApiResponse,
  AuthResponse,
  EmailCheckResponse,
} from "../authService";
import { AxiosError } from "axios";
import { router } from "expo-router";
import { AuthEventEmitter } from "@/src/lib/api/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkEmail: (email: string) => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
  onAuthSuccess?: () => void;
  onSignOut?: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  onAuthSuccess = () => router.replace("/(protected)/(tabs)"),
  onSignOut = () => router.replace("/(auth)"),
}: AuthProviderProps) {
  const queryClient = useQueryClient();

  const { data: token, isLoading } = useQuery({
    queryKey: ["authToken"],
    queryFn: async () => {
      const token = await tokenService.getToken();
      console.debug(
        "[AuthContext] Token from query:",
        token ? "exists" : "null"
      );
      return token;
    },
    staleTime: Infinity,
    initialData: null,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await tokenService.getToken();
        if (storedToken) {
          queryClient.setQueryData(["authToken"], storedToken);
          console.debug("[AuthContext] Restored auth state from storage");
        }
      } catch (error) {
        console.error("[AuthContext] Error initializing auth state:", error);
        await handleSignOut();
      }
    };

    initAuth();
  }, [queryClient]);

  useEffect(() => {
    console.debug("[AuthContext] Auth state changed:", {
      isAuthenticated: !!token,
      isLoading,
    });
  }, [token, isLoading]);

  const handleSignOut = useCallback(async () => {
    console.debug("[AuthContext] Signing out...");
    await tokenService.clearTokens();
    queryClient.setQueryData(["authToken"], null);
    queryClient.removeQueries({ queryKey: ["user"] });
    onSignOut();
  }, [queryClient, onSignOut]);

  const handleAuthFailure = useCallback(async () => {
    console.debug("[AuthContext] Handling auth failure...");
    await handleSignOut();
  }, [handleSignOut]);

  useEffect(() => {
    AuthEventEmitter.setAuthFailureHandler(handleAuthFailure);
  }, [handleAuthFailure]);

  const checkEmailMutation = useMutation<
    ApiResponse<EmailCheckResponse>,
    AxiosError,
    string
  >({
    mutationFn: async (email: string) => {
      const axiosResponse = await authService.checkEmailExists(email);
      return axiosResponse.data;
    },
  });

  const signUpMutation = useMutation<
    ApiResponse<AuthResponse>,
    AxiosError,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      console.debug("[AuthContext] Starting signup...");
      const axiosResponse = await authService.signUp(
        credentials.email,
        credentials.password
      );
      const response = axiosResponse.data;
      if (!response.success) {
        throw new Error(response.message);
      }
      if (response.payload?.token) {
        console.debug("[AuthContext] Setting tokens from signup...");
        await tokenService.setToken(response.payload.token);
        if (response.payload.refreshToken) {
          await tokenService.setRefreshToken(response.payload.refreshToken);
        }
        queryClient.setQueryData(["authToken"], response.payload.token);
        console.debug("[AuthContext] Tokens set from signup");
      }
      return response;
    },
    onSuccess: () => {
      console.debug("[AuthContext] Signup successful");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onAuthSuccess();
    },
  });

  const signInMutation = useMutation<
    ApiResponse<AuthResponse>,
    AxiosError,
    { email: string; password: string }
  >({
    mutationFn: async (credentials) => {
      console.debug("[AuthContext] Starting signin...");
      const axiosResponse = await authService.signIn(
        credentials.email,
        credentials.password
      );
      const response = axiosResponse.data;
      if (!response.success) {
        throw new Error(response.message);
      }
      if (response.payload?.token) {
        console.debug("[AuthContext] Setting tokens from signin...");
        await tokenService.setToken(response.payload.token);
        if (response.payload.refreshToken) {
          await tokenService.setRefreshToken(response.payload.refreshToken);
        }
        queryClient.setQueryData(["authToken"], response.payload.token);
        console.debug("[AuthContext] Tokens set from signin");
      }
      return response;
    },
    onSuccess: () => {
      console.debug("[AuthContext] Signin successful");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      onAuthSuccess();
    },
  });

  const value = {
    isAuthenticated: !!token,
    isLoading,
    token,
    signIn: async (email: string, password: string) => {
      await signInMutation.mutateAsync({ email, password });
    },
    signUp: async (email: string, password: string) => {
      await signUpMutation.mutateAsync({ email, password });
    },
    signOut: handleSignOut,
    checkEmail: async (email: string) => {
      await checkEmailMutation.mutateAsync(email);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
