import AsyncStorage from "@react-native-async-storage/async-storage";
import { checkEmailExists, signIn } from "@/services/authService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState({
    isAuthed: false,
    token: "",
  });

  // Sign out
  const { mutate: signOut } = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("authToken");
      setAuthState({ isAuthed: false, token: "" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Sign in
  const { mutateAsync: signInMutate } = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await signIn(email, password);
      if (response.status === "success") {
        handleSuccess(response.data.token);
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Check if email exists
  const { data: doesEmailExist = null, mutateAsync: checkEmailMutate } =
    useMutation({
      mutationFn: async (email: string) => {
        const response = await checkEmailExists(email);
        if (response.status === "success") {
          return true;
        } else if (response.status === "error") {
          return false;
        }
      },
    });

  // Handle success for sign-in or sign-up
  const handleSuccess = async (newToken: string) => {
    await AsyncStorage.setItem("authToken", newToken);
    setAuthState({ isAuthed: true, token: newToken });
  };

  // Check the auth state
  const checkAuthState = async () => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        setAuthState({ isAuthed: true, token: authToken });
      }
    } catch (error) {
      console.error("Failed to check auth state:", error);
    }
  };

  return {
    isAuthed: authState.isAuthed,
    token: authState.token,
    signOut,
    handleSuccess,
    checkAuthState,
    checkEmailMutate,
    doesEmailExist,
    signInMutate,
  };
};
