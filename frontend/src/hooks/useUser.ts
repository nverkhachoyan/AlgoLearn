import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/src/features/auth/authService";
import * as userService from "@/src/features/user/api/queries";
import { User } from "../features/user/types";
import { ApiResponse } from "../types";

type SignInResponse = {
  token: string;
  user: User;
};

export function useUser() {
  const queryClient = useQueryClient();

  const { data: token, isSuccess: isInitialized } = useQuery({
    queryKey: ["authToken"],
    queryFn: () => AsyncStorage.getItem("authToken"),
    staleTime: Infinity,
  });

  const {
    data: user,
    isPending: isUserPending,
    error: userError,
    isError: isUserError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        if (!token) throw new Error("No auth token");
        const axiosResponse = await userService.fetchUser(token);
        const response = axiosResponse.data;

        if (!response.success) {
          throw new Error(response.message);
        }

        return response.payload;
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error.message === "No auth token"
        ) {
          console.log("Auth error detected, clearing auth state...");
          await invalidateAuth();
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const checkEmail = useMutation({
    mutationFn: async (email: string) => {
      try {
        const axiosResponse = await authService.checkEmailExists(email);
        const response = axiosResponse.data;
        if (!response.success) {
          throw new Error(response.message);
        }
        return response.payload;
      } catch (error: any) {
        throw error;
      }
    },
  });

  const signIn = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const axiosResponse = await authService.signIn(
          credentials.email,
          credentials.password
        );
        const response: ApiResponse<SignInResponse> = axiosResponse.data;

        if (!response.success) {
          throw new Error(response.message);
        }

        if (response.payload?.token) {
          await AsyncStorage.setItem("authToken", response.payload.token);
          queryClient.setQueryData(["authToken"], response.payload.token);
        }
        return response.payload;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("authToken");
      queryClient.setQueryData(["authToken"], null);
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async (data: any) => {
      try {
        if (!token) throw new Error("No auth token");
        const axiosResponse = await userService.updateUser(token, data);
        const response = axiosResponse.data;

        if (!response.success) {
          throw new Error(response.message);
        }

        return response.payload;
      } catch (error: any) {
        if (
          error?.response?.status === 401 ||
          error.message === "No auth token"
        ) {
          console.log(
            "Auth error detected in updateUser, clearing auth state..."
          );
          await invalidateAuth();
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const invalidateAuth = async () => {
    await AsyncStorage.removeItem("authToken");
    queryClient.setQueryData(["authToken"], null);
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: ["user"] });
  };

  const isAuthenticated = !!token && !!user && !isUserError;
  const isLoading = !isInitialized || (!!token && isUserPending);

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    isUserPending,
    userError,
    checkEmail,
    signIn,
    signOut,
    updateUser,
    invalidateAuth,
  };
}
