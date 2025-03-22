import { create } from "zustand";
import { AuthState } from "./authSlice";
import { UserState } from "./userSlice";
import { CoursesState } from "./coursesSlice";

import createAuthSlice from "./authSlice";
import createUserSlice from "./userSlice";
import createCoursesSlice from "./coursesSlice";

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...createAuthSlice(set, get),
}));

export const useUserStore = create<UserState>()((set, get) => ({
  ...createUserSlice(set, get),
}));

export const useCoursesStore = create<CoursesState>()((set, get) => ({
  ...createCoursesSlice(set, get),
}));
