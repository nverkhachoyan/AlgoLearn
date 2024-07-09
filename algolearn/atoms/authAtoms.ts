import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { User } from "@/types/userTypes";
import { fetchUser, deleteAccount } from "@/services/authService";

export const tokenAtom = atom<string | null>(null);
export const isAuthedAtom = atom<boolean>(false);

// Atom to fetch the user data
export const userAtom = atomWithQuery<User | null>((get) => ({
  queryKey: ["user", get(tokenAtom)],
  queryFn: async () => {
    const token = get(tokenAtom);
    if (!token) {
      throw new Error("No token available");
    }
    return fetchUser(token);
  },
  enabled: !!get(tokenAtom),
}));

// Atom to delete the user account
export const deleteAccountAtom = atom(null, async (get, set) => {
  const token = get(tokenAtom);
  if (!token) {
    throw new Error("No token available");
  }
  await deleteAccount(token);
  set(tokenAtom, null);
  set(isAuthedAtom, false);
});
