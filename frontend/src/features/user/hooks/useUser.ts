import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as userService from "@/src/features/user/api/queries";
import { User } from "../types";
import { AxiosError } from "axios";
import type { ApiResponse } from "@/src/features/auth/authService";

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
    isSuccess: isUserSuccess,
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
          return null;
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const updateUser = useMutation<ApiResponse<User>, AxiosError, any>({
    mutationFn: async (data: any) => {
      try {
        if (!token) throw new Error("No auth token");
        const axiosResponse = await userService.updateUser(token, data);
        const response = axiosResponse.data;

        if (!response.success) {
          throw new Error(response.message);
        }

        return response;
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

  const isAuthenticated = !!token && isUserSuccess && !!user;
  const isLoading = !isInitialized || (!!token && isUserPending);

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
    isUserPending,
    userError,
    updateUser,
    invalidateAuth,
  };
}
