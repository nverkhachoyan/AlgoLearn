import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "@/src/features/auth/authService";
import * as userService from "@/src/features/user/api/queries";

export function useUser() {
  const queryClient = useQueryClient();

  // Auth token query
  const { data: token, isSuccess: isInitialized } = useQuery({
    queryKey: ["authToken"],
    queryFn: () => AsyncStorage.getItem("authToken"),
    staleTime: Infinity, // Don't refetch token automatically
  });

  // User data query
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
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
        throw error;
      }
    },
    enabled: !!token,
  });

  // Check email mutation
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

  // Sign in mutation
  const signIn = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      try {
        const axiosResponse = await authService.signIn(
          credentials.email,
          credentials.password
        );
        const response = axiosResponse.data;

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

  // Sign out mutation
  const signOut = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("authToken");
      queryClient.setQueryData(["authToken"], null);
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: (data: any) => {
      if (!token) throw new Error("No auth token");
      return userService.updateUser(token, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  const invalidateAuth = async () => {
    await AsyncStorage.removeItem("authToken");
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: ["user"] });
  };

  return {
    isAuthed: !!token,
    isInitialized,
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
