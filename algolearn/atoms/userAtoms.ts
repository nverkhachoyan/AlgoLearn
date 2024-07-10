import { atom } from "jotai";
import { atomWithQuery, atomWithMutation } from "jotai-tanstack-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/userTypes";
import { fetchUser, deleteAccount } from "@/services/authService";

export const tokenAtom = atom<string | null>(null);
export const isAuthedAtom = atom<boolean>(false);

// User atom with query
export const userAtom = atomWithQuery<User | null>((get) => ({
  queryKey: ["user", get(tokenAtom)],
  queryFn: async () => {
    const token = get(tokenAtom);
    if (!token) return null;
    return fetchUser(token);
  },
  enabled: !!get(tokenAtom),
}));

// Delete account atom with mutation
export const deleteAccountAtom = atomWithMutation((get) => ({
  mutationKey: ["deleteAccount"],
  mutationFn: async () => {
    const token = get(tokenAtom);
    if (!token) throw new Error("No token available");
    const data = await deleteAccount(token);
    return data;
  },
}));

// Sign out thunk
export const signOutAtom = atom(null, async (get, set) => {
  await AsyncStorage.removeItem("authToken");
  set(tokenAtom, null);
  set(isAuthedAtom, false);
});

// Handle success thunk
export const handleSuccessAtom = atom(
  null,
  async (get, set, newToken: string) => {
    set(tokenAtom, newToken);
    await AsyncStorage.setItem("authToken", newToken);
    set(isAuthedAtom, true);
  },
);

// Check auth state thunk
export const checkAuthStateAtom = atom(null, async (get, set) => {
  try {
    const authToken = await AsyncStorage.getItem("authToken");
    if (authToken) {
      set(tokenAtom, authToken);
      set(isAuthedAtom, true);
    }
  } catch (error) {
    console.error("Failed to check auth state:", error);
  }
});
