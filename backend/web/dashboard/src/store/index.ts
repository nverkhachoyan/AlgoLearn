import { create } from "zustand";
import { persist, PersistOptions } from "zustand/middleware";
import { StoreState } from "./types";
import createAuthSlice from "./authSlice";
import createCoursesSlice from "./courseSlice";
import createUISlice from "./UISlice";

type StoreWithPersist = StoreState & {
  _hasHydrated?: boolean;
};

const persistOptions: PersistOptions<StoreWithPersist> = {
  name: "store",
  onRehydrateStorage: () => (state) => {
    state && (state._hasHydrated = true);
  },
};

const useStore = create<StoreWithPersist>()(
  persist(
    (set, get) => ({
      ...createAuthSlice(set, get),
      ...createCoursesSlice(set, get),
      ...createUISlice(set),
      isDarkMode: false,
      setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
      _hasHydrated: false,
    }),
    persistOptions
  )
);

export default useStore;
