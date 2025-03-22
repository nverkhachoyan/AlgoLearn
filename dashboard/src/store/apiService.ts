import { useAuthStore } from "./index.ts";

export const apiService = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return useAuthStore.getState().authFetch(input, init);
  },
};
