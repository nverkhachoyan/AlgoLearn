import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser, deleteAccount, updateUser } from "@/services/userServices";
import { getAuthToken } from "@/services/authService";

import { User } from "../types/userTypes";
import { Response } from "@/types/apiTypes";
import { ImageFile } from "@/types/CommonTypes";

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
  mutate: (data: V) => void;
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
};

export const useUser = (): UseUserReturn => {
  // Fetch user data
  const userMutation = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const authToken = await getAuthToken();
      if (authToken) {
        const user = await fetchUser(authToken);
        return { ...user.data, token: authToken };
      }
      return null;
    },
  });

  // Update user data
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      const token = await getAuthToken();
      console.log("lets see if this logs from useUser");
      console.log("data: ", data);

      return updateUser(token, data);
    },
  });

  // Delete account
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const token = await getAuthToken();
      return deleteAccount(token);
    },
  });

  return {
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
      mutate: deleteAccountMutation.mutate,
      data: deleteAccountMutation.data,
      isPending: deleteAccountMutation.isPending,
      error: deleteAccountMutation.error,
    },
  };
};
