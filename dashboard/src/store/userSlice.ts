import { apiUrl } from "./utils";
import { User } from "./types";
import { apiService } from "./apiService";
import { SetState, GetState } from ".";
import { TOKEN_STORAGE_KEY, REFRESH_TOKEN_STORAGE_KEY } from "./utils";

export interface UserState {
  user: User | null;
  isUserLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

const createUserSlice = (set: SetState<UserState>, _: GetState<UserState>) => {
  return {
    user: null,
    isUserLoading: false,

    login: async (email: string, password: string) => {
      set({ isUserLoading: true, error: null });

      try {
        const response = await fetch(`${apiUrl}/users/sign-in`, {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        const payload = data.payload;

        // Store tokens in localStorage
        localStorage.setItem(TOKEN_STORAGE_KEY, payload.token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, payload.refreshToken);

        // Update auth state
        set({
          token: payload.token,
          refreshToken: payload.refreshToken,
          isAuthenticated: true,
          isUserLoading: false,
        });

        // Update user data
        set({ user: payload.user });
      } catch (error) {
        set({
          error: (error as Error).message,
          isUserLoading: false,
          isAuthenticated: false,
        });
      }
    },

    logout: async () => {
      // Clear localStorage
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

      // Reset state
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },

    fetchUser: async () => {
      set({ isUserLoading: true, error: null });

      try {
        const response = await apiService.fetch(`${apiUrl}/users/me`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Fetch user failed");
        }

        const data = await response.json();
        set({
          user: data.payload,
          isUserLoading: false,
        });
      } catch (error) {
        console.error(error);
        set({
          error: (error as Error).message,
          isUserLoading: false,
        });
      }
    },
  };
};

export default createUserSlice;
