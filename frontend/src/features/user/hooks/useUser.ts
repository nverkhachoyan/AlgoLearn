import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUser,
  updateUser as updateUserApi,
} from "../api/queries";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import type { User } from "../types/index";

export function useUser() {
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      if (!token) {
        return null;
      }
      try {
        const response = await fetchUser(token);
        return response.data.payload;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!token && isAuthenticated,
    retry: false,
    gcTime: 0,
    staleTime: 5 * 60 * 1000,
  });

  if (error) {
    console.error("[useUser] Query error:", error);
  }

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!token) throw new Error("No token available");
      const response = await updateUserApi(token, userData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  return {
    user,
    error,
    updateUser: updateUserMutation,
  };
}
