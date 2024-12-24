import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUser,
  updateUser as updateUserApi,
  deleteAccount,
} from "../api/queries";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import type { User } from "../types";

export function useUser() {
  console.debug("[useUser] Hook called");
  const { token, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: user, error } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      console.debug("[useUser] Fetching user data");
      if (!token) {
        console.debug("[useUser] No token available");
        return null;
      }
      try {
        const response = await fetchUser(token);
        console.debug("[useUser] User data fetched:", response.data);
        return response.data.payload;
      } catch (error) {
        console.error("[useUser] Error fetching user:", error);
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
