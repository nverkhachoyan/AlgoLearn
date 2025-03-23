import { useStore } from "./index.ts";

export const apiService = {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return useStore.getState().authFetch(input, init);
  },
};
