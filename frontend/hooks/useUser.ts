import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useMutation,
  useQuery,
  useQueryClient,
  MutationFunction,
} from "@tanstack/react-query";
import {useState, useCallback} from "react";
import {
  checkEmailExists,
  signIn,
  signUp,
  getAuthToken,
} from "@/services/authService";
import {fetchUser, deleteAccount, updateUser} from "@/services/userServices";
import {User} from "@/types/userTypes";
import {Response} from "@/types/apiTypes";
import {ImageFile} from "@/types/CommonTypes";
import {useGoogleAuth} from "@/hooks/useGoogleAuth";

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
  user: FetchUserObject;
  updateUser: UpdateUserObject;
  deleteAccount: DeleteAccountObject;
  isAuthed: boolean;
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

export const useUser = (): UseUserReturn => {
  const queryClient = useQueryClient();
  const [authState, setAuthState] = useState({
    isAuthed: false,
    token: "",
  });

  // Handle success for sign-in or sign-up
  const handleSuccess = async (token: string) => {
    await AsyncStorage.setItem("authToken", token);
    setAuthState((prevState) => ({...prevState, isAuthed: true, token}));
  };

  // Handle error in authentication or user management
  const handleError = useCallback((error: Error) => {
    console.error("Authentication error:", error);
    signOutMutation.mutate();
  }, []);

  // Google sign-in logic
  const {promptAsync} = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  // Sign out
  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem("authToken");
      setAuthState({isAuthed: false, token: ""});
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["user"]});
      queryClient.removeQueries({queryKey: ["user"]});
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
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["user"]});
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
  });

  // Check if email exists
  const checkEmailMutatation = useMutation({
    mutationFn: async (email: string) => {
      return await checkEmailExists(email);
    },
  });

  // Check the auth state
  const checkAuthState = async (): Promise<boolean> => {
    try {
      const authToken = await AsyncStorage.getItem("authToken");
      if (authToken) {
        setAuthState({isAuthed: true, token: authToken});
        queryClient.invalidateQueries({queryKey: ["user"]});
        return true;
      } else {
        setAuthState({isAuthed: false, token: ""});
        return false;
      }
    } catch (error) {
      console.error("Failed to check auth state:", error);
      setAuthState({isAuthed: false, token: ""});
      return false;
    }
  };

  // Invalidate authentication
  const invalidateAuth = async () => {
    await AsyncStorage.removeItem("authToken");
    setAuthState({isAuthed: false, token: ""});
    queryClient.invalidateQueries({queryKey: ["user"]});
  };

  // Fetch user data
  const userMutation = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const authToken = await getAuthToken();
      if (authToken) {
        const user = await fetchUser(authToken);
        return {...user.data, token: authToken};
      }
      return null;
    },
    enabled: authState.isAuthed,
  });

  // Update user data
  const updateUserMutation = useMutation({
    mutationFn: async (data: UpdateUserData) => {
      await checkAuthState();
      const token = await getAuthToken();
      return updateUser(token, data);
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({queryKey: ["user"]});

      const previousUserData = queryClient.getQueryData(["user"]);

      queryClient.setQueryData(["user"], (old: any) => {
        return {
          ...old,
          ...newData, // Optimistically update the user data
        };
      });

      return {previousUserData};
    },
    onSettled: () => {
      queryClient.invalidateQueries({queryKey: ["user"]});
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const token = await getAuthToken();
      const response = await deleteAccount(token);
      if (response.success) {
        await invalidateAuth();
        return true;
      }
      return false;
    },
  });

  return {
    // Auth state
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
      mutate: checkEmailMutatation.mutate,
      data: checkEmailMutatation.data,
      isPending: checkEmailMutatation.isPending,
    },

    // User state
    user: {
      isPending: userMutation.isPending,
      data: userMutation.data,
      error: userMutation.error,
    },
    updateUser: {
      mutate: updateUserMutation.mutate,
      data: updateUserMutation.data,
      isPending: updateUserMutation.isPending,
      error: updateUserMutation.error,
    },
    deleteAccount: {
      mutateAsync: deleteAccountMutation.mutateAsync,
      mutate: deleteAccountMutation.mutateAsync,
      data: deleteAccountMutation.data,
      isPending: deleteAccountMutation.isPending,
      error: deleteAccountMutation.error,
    },

    // Additional utilities
    handleSuccess,
    handleError,
    signInWithGoogle,
    invalidateAuth,
  };
};
