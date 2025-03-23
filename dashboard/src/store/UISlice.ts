import { StateCreator } from "zustand";
import { SetState, GetState } from ".";

export interface UIState {
  sidebarCollapsed: boolean;
  isDarkMode: boolean;
  useSystemTheme: boolean;
  error: string | null;
  setIsDarkMode: (isDark: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDarkMode: () => void;
  setUseSystemTheme: (useSystem: boolean) => void;
  setError: (error: string | null) => void;
}

const createUISlice = (set: SetState<UIState>, get: GetState<UIState>) => {
  return {
    sidebarCollapsed: false,
    isDarkMode: false,
    useSystemTheme: true,
    error: null,

    setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
    setSidebarCollapsed: (collapsed: boolean) =>
      set({ sidebarCollapsed: collapsed }),
    toggleDarkMode: () =>
      set((state: UIState) => ({ isDarkMode: !state.isDarkMode })),
    setUseSystemTheme: (useSystem: boolean) =>
      set({ useSystemTheme: useSystem }),

    setError: (error: string | null) => set({ error }),
  };
};

export default createUISlice;
