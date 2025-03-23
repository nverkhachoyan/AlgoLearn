import {
  getAuthHeaders,
  getRefreshedTokens,
  TOKEN_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "./utils";
import { SetState, GetState } from ".";

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isTokenRetry: boolean;
  authError: string | null;
  isAuthenticated: boolean;

  authFetch: (
    input: RequestInfo | URL,
    init?: RequestInit
  ) => Promise<Response>;
  setAuthState: (
    token: string,
    refreshToken: string,
    isAuthenticated: boolean
  ) => Promise<void>;
  destroyAuthState: () => Promise<void>;
}

const createAuthSlice = (
  set: SetState<AuthState>,
  get: GetState<AuthState>
) => {
  const storedToken =
    typeof window !== "undefined"
      ? localStorage.getItem(TOKEN_STORAGE_KEY)
      : null;
  const storedRefreshToken =
    typeof window !== "undefined"
      ? localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
      : null;

  return {
    token: storedToken || null,
    refreshToken: storedRefreshToken || null,
    isTokenRetry: false,
    isAuthenticated: !!storedToken,
    authError: null,

    authFetch: async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const state = get();

      if (!state.token) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        set({ token: null, refreshToken: null, isAuthenticated: false });
        throw new Error("No authentication token available");
      }

      const authHeaders = getAuthHeaders(state.token);
      let response;

      try {
        response = await fetch(input, {
          ...init,
          headers: {
            ...init?.headers,
            ...authHeaders,
          },
        });

        if (response.ok) return response;
      } catch (err) {
        console.log("ERROR HERE", err);
        throw new Error("Failed to fetch resource");
      }

      if (!state.refreshToken) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        set({ token: null, refreshToken: null, isAuthenticated: false });
        throw new Error("No refresh token available");
      }

      try {
        const clonedResponse = response.clone();
        const errorData = await clonedResponse.json();

        if (errorData.errorCode === "TOKEN_EXPIRED" && !state.isTokenRetry) {
          set({ isTokenRetry: true });

          try {
            const newTokens = await getRefreshedTokens(state.refreshToken);
            if (newTokens) {
              set({
                token: newTokens.token,
                refreshToken: newTokens.refreshToken,
                isTokenRetry: false,
              });

              const newAuthHeaders = getAuthHeaders(newTokens.token);
              return fetch(input, {
                ...init,
                headers: {
                  ...init?.headers,
                  ...newAuthHeaders,
                },
              });
            }
          } finally {
            set({ isTokenRetry: false });
          }
        }
      } catch (err) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        set({ token: null, refreshToken: null, isAuthenticated: false });
        console.error("Error handling token refresh:", err);
        throw err;
      }

      return response;
    },

    setAuthState: async (
      token: string,
      refreshToken: string,
      isAuthenticated: boolean
    ): Promise<void> => {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
      set({ token, refreshToken, isAuthenticated });
    },

    destroyAuthState: async (): Promise<void> => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      set({ token: null, refreshToken: null, isAuthenticated: false });
      return Promise.resolve();
    },
  };
};

export default createAuthSlice;
