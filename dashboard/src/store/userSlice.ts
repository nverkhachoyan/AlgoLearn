import { apiUrl } from "./utils";
import { StateCreator } from "zustand";
import { User } from "./types";
import { apiService } from "./apiService";
import { useAuthStore } from ".";

export interface UserState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export type UserStoreCreator<T> = StateCreator<UserState, [], [], T>;
export type SetUserState = Parameters<UserStoreCreator<UserState>>[0];
export type GetUserState = () => UserState;

const createUserSlice = (set: SetUserState, _: () => UserState) => {
  return {
    user: null,

    login: async (email: string, password: string) => {
      const response = await fetch(`${apiUrl}/users/sign-in`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      const payload = data.payload;
      const setAuthState = useAuthStore.getState().setAuthState;
      setAuthState(payload.token, payload.refreshToken, true);
      set({
        user: payload.user,
      });
    },

    logout: async () => {
      const authStore = useAuthStore.getState();
      await authStore.destroyAuthState();
      set({ user: null });
    },

    fetchUser: async () => {
      try {
        const response = await apiService.fetch(`${apiUrl}/users/me`);
        if (!response.ok) {
          throw new Error("Fetch user failed");
        }
        const data = await response.json();
        set({ user: data.payload });
      } catch (err) {
        console.error(err);
      }
    },
  };
};

export default createUserSlice;
