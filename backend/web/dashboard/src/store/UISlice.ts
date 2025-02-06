import { StoreState, SetState } from "./types";

export interface UIState {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const createUISlice = (set: SetState) => ({
  sidebarCollapsed: false,
  isDarkMode: false,
  setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
  setSidebarCollapsed: (collapsed: boolean) =>
    set({ sidebarCollapsed: collapsed }),
  toggleDarkMode: () =>
    set((state: StoreState) => ({ isDarkMode: !state.isDarkMode })),
});

export default createUISlice;
