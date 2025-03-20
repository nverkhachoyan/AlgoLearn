import { apiUrl, getAuthHeaders } from "./utils";
import { User } from "../types/models";
import { SetState, GetState, StoreState } from "./types";
import { debounce } from "lodash";

export interface AuthState {
  user: User | null;
  token: string;
  isAuthenticated: boolean;
  authError: string | null;

  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  debouncedLogin: (email: string, password: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  debouncedCheckAuth: () => void;
  abortAuthRequest: (requestType: string) => void;
}

const createAuthSlice = (set: SetState, get: GetState) => {
  // Create debounced versions of the API calls
  const debouncedLoginImpl = debounce(
    async (email: string, password: string) => {
      const slice = createAuthSlice(set, get);
      await slice.login(email, password);
    },
    500
  );

  const debouncedCheckAuthImpl = debounce(async () => {
    const slice = createAuthSlice(set, get);
    await slice.checkAuth();
  }, 500);

  return {
    user: null,
    token: "",
    isAuthenticated: false,
    authError: null,

    // Add debounced methods
    debouncedLogin: (email: string, password: string) => {
      debouncedLoginImpl(email, password);
    },

    debouncedCheckAuth: () => {
      debouncedCheckAuthImpl();
    },

    abortAuthRequest: (requestType: string) => {
      const state = get();
      const controller = state.requestControllers[requestType];
      if (controller) {
        controller.abort();
        set((state: StoreState) => ({
          requestControllers: {
            ...state.requestControllers,
            [requestType]: null,
          },
        }));
      }
    },

    login: async (email: string, password: string) => {
      const state = get();

      // Abort any existing login request
      const loginController = state.requestControllers["login"];
      if (loginController) {
        loginController.abort();
      }

      // Create new AbortController
      const abortController = new AbortController();
      set((state: StoreState) => ({
        requestControllers: {
          ...state.requestControllers,
          login: abortController,
        },
      }));

      set({ isLoading: true, authError: null });
      try {
        const response = await fetch(`${apiUrl}/users/sign-in`, {
          method: "POST",
          headers: getAuthHeaders(""),
          body: JSON.stringify({ email, password }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Login failed");
        }

        const data = await response.json();
        console.log("Login response:", data);

        const token = data.payload.token;
        const user = data.payload.user;

        if (!token) {
          throw new Error("No token received from server");
        }

        set((state: StoreState) => ({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          authError: null,
          requestControllers: {
            ...state.requestControllers,
            login: null,
          },
        }));

        const newState = get();
        console.log("Auth state after login:", {
          token: newState.token,
          isAuthenticated: newState.isAuthenticated,
          user: newState.user,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set((state: StoreState) => ({
            authError: (error as Error).message,
            isLoading: false,
            isAuthenticated: false,
            token: "",
            requestControllers: {
              ...state.requestControllers,
              login: null,
            },
          }));
        }
      }
    },

    logout: () =>
      set((state: StoreState) => ({
        user: null,
        token: "",
        isAuthenticated: false,
        authError: null,
        courses: [], // Clear courses on logout
        requestControllers: {
          ...state.requestControllers,
          login: null,
          checkAuth: null,
        },
      })),

    checkAuth: async () => {
      const state = get();
      const token = state.token;

      if (!token) {
        set({ isAuthenticated: false });
        return;
      }

      // Abort any existing checkAuth request
      const checkAuthController = state.requestControllers["checkAuth"];
      if (checkAuthController) {
        checkAuthController.abort();
      }

      // Create new AbortController
      const abortController = new AbortController();
      set((state: StoreState) => ({
        requestControllers: {
          ...state.requestControllers,
          checkAuth: abortController,
        },
      }));

      try {
        const response = await fetch(`${apiUrl}/users/me`, {
          headers: getAuthHeaders(token),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();
        set((state: StoreState) => ({
          user: data.payload.user,
          isAuthenticated: true,
          requestControllers: {
            ...state.requestControllers,
            checkAuth: null,
          },
        }));
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          set((state: StoreState) => ({
            user: null,
            token: "",
            isAuthenticated: false,
            authError: (error as Error).message,
            requestControllers: {
              ...state.requestControllers,
              checkAuth: null,
            },
          }));
        }
      }
    },
  };
};

export default createAuthSlice;
