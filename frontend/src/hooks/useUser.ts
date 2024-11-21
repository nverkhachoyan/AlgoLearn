import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useMutation,
  useQuery,
  useQueryClient,
  MutationFunction,
} from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import {
  checkEmailExists,
  signIn,
  signUp,
  getAuthToken,
} from "@/src/features/auth/authService";
import {
  fetchUser,
  deleteAccount,
  updateUser,
} from "@/src/features/user/userServices";
import { User } from "@/src/types/userTypes";
import { Response } from "@/src/types/apiTypes";
import { ImageFile } from "@/src/types/CommonTypes";
import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";

// Interface for updating user data
interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  preferences?: JSON;
  avatar?: ImageFile;
}

interface UserWithToken extends User {
  token?: string;
}

// Generic types for query and mutation objects
type QueryObject<T> = {
  data: T | any;
  isPending: boolean;
  error: any;
};

type MutationObject<T, V> = {
  mutateAsync?: any;
  mutate: any;
  data: T | any;
  isPending: boolean;
  error: any;
};

type FetchUserObject = QueryObject<UserWithToken>;
type UpdateUserObject = MutationObject<UserWithToken, UpdateUserData>;
type DeleteAccountObject = MutationObject<Response, void>;

// Return type for useUser hook
export type UseUserReturn = {
  user?: UserWithToken | undefined;
  updateUser: UpdateUserObject;
  deleteAccount: DeleteAccountObject;
  isAuthed: boolean;
  isInitialized: boolean;
  token: string;
  signOut: {
    mutate: () => void;
  };
  signIn: {
    mutate: any;
  };
  signUp: {
    mutate: any;
    data: Response | undefined;
    isPending: boolean;
    error: any;
  };
  checkAuthState: () => Promise<boolean>;
  checkEmail: {
    mutate: any;
    data: any;
    isPending: boolean;
  };
  handleSuccess: (token: string) => Promise<void>;
  handleError: (error: Error) => void;
  signInWithGoogle: () => Promise<void>;
  invalidateAuth: () => Promise<void>;
};

export const useUser = (): any => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState({
    isAuthed: false,
    token: "",
    isInitialized: false,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (authToken) {
          setAuthState({
            isAuthed: true,
            token: authToken,
            isInitialized: true,
          });
          queryClient.invalidateQueries({ queryKey: ["user"] });
        } else {
          setAuthState({
            isAuthed: false,
            token: "",
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error("Failed to initialize auth state:", error);
        setAuthState({
          isAuthed: false,
          token: "",
          isInitialized: true,
        });
      }
    };

    initAuth();
  }, []);

  // Handle success for sign-in or sign-up
  const handleSuccess = async (token: string) => {
    await AsyncStorage.setItem("authToken", token);
    setAuthState((prevState) => ({
      ...prevState,
      isAuthed: true,
      token,
      isInitialized: true,
    }));
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  // Handle error in authentication or user management
  const handleError = useCallback((error: Error) => {
    console.error("Authentication error:", error);
    signOutMutation.mutate();
  }, []);

  // Google sign-in logic
  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  // Sign out
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("authToken");
      setAuthState({
        isAuthed: false,
        token: "",
        isInitialized: true,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });

  // Sign in
  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await signIn(email, password);
      if (response.data.success) {
        await handleSuccess(response.data.data.token);
      }
      return response;
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      setAuthState((prevState) => ({
        ...prevState,
        isAuthed: false,
        token: "",
        isInitialized: true,
      }));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Sign up
  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const response = await signUp(email, password);
      if (response.success) {
        await handleSuccess(response.data.token);
      }
      return response;
    },
    onError: (error) => {
      console.error("Sign up error:", error);
      setAuthState((prevState) => ({
        ...prevState,
        isAuthed: false,
        token: "",
        isInitialized: true,
      }));
    },
  });

  // Check if email exists
  const checkEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return await checkEmailExists(email);
    },
  });

  // Check the auth state
  const checkAuthState = async (): Promise<boolean> => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        setAuthState({
          isAuthed: true,
          token: authToken,
          isInitialized: true,
        });
        queryClient.invalidateQueries({ queryKey: ["user"] });
        return true;
      } else {
        setAuthState({
          isAuthed: false,
          token: "",
          isInitialized: true,
        });
        return false;
      }
    } catch (error) {
      console.error("Failed to check auth state:", error);
      setAuthState({
        isAuthed: false,
        token: "",
        isInitialized: true,
      });
      return false;
    }
  };

  // Invalidate authentication
  const invalidateAuth = async () => {
    await AsyncStorage.removeItem("authToken");
    setAuthState({
      isAuthed: false,
      token: "",
      isInitialized: true,
    });
    queryClient.invalidateQueries({ queryKey: ["user"] });
    queryClient.removeQueries({ queryKey: ["user"] });
  };

  // Fetch user data
  const {
    data: user,
    isPending: isUserPending,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const authToken = await getAuthToken();
      if (!authToken) {
        throw new Error("No auth token found");
      }
      const user = await fetchUser(authToken);
      if (!user || !user) {
        throw new Error("Failed to fetch user data");
      }
      return { ...user, token: authToken };
    },
    enabled: authState.isAuthed && authState.isInitialized,
    retry: 1,
  });

  // Update user data
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      await checkAuthState();
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No auth token found");
      }
      return updateUser(token, data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["user"] });
      const previousUserData = queryClient.getQueryData(["user"]);
      queryClient.setQueryData(["user"], (old: any) => ({
        ...old,
        ...newData,
      }));
      return { previousUserData };
    },
    onError: (error, variables, context) => {
      console.error("Update user error:", error);
      if (context?.previousUserData) {
        queryClient.setQueryData(["user"], context.previousUserData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No auth token found");
      }
      const response = await deleteAccount(token);
      if (response.success) {
        await invalidateAuth();
        return true;
      }
      return false;
    },
    onError: (error) => {
      console.error("Delete account error:", error);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["user"] });
    },
  });

  return {
    isInitialized: authState.isInitialized,
    isAuthed: authState.isAuthed,
    token: authState.token,
    signOut: {
      mutate: signOutMutation.mutate,
    },
    signIn: {
      mutate: signInMutation.mutate,
    },
    signUp: {
      mutate: signUpMutation.mutate,
      data: signUpMutation.data,
      isPending: signUpMutation.isPending,
      error: signUpMutation.error,
    },
    checkAuthState,
    checkEmail: {
      mutate: checkEmailMutation.mutate,
      data: checkEmailMutation.data,
      isPending: checkEmailMutation.isPending,
    },
    user,
    isUserPending,
    userError,
    // user: {
    //   isPending: userQuery.isPending,
    //   data: userQuery.data,
    //   error: userQuery.error,
    // },
    updateUser: {
      mutate: updateUserMutation.mutate,
      data: updateUserMutation.data,
      isPending: updateUserMutation.isPending,
      error: updateUserMutation.error,
    },
    deleteAccount: {
      mutateAsync: deleteAccountMutation.mutateAsync,
      mutate: deleteAccountMutation.mutate,
      data: deleteAccountMutation.data,
      isPending: deleteAccountMutation.isPending,
      error: deleteAccountMutation.error,
    },
    handleSuccess,
    handleError,
    signInWithGoogle,
    invalidateAuth,
  };
};
