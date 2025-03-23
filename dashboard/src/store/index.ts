import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

import createAuthSlice, { AuthState } from "./authSlice";
import createUserSlice, { UserState } from "./userSlice";
import createCoursesSlice, { CoursesState } from "./coursesSlice";
import createUISlice, { UIState } from "./UISlice";

export const useStore = create<StoreState>()(
  devtools(
    (set, get) => ({
      ...createAuthSlice(set as any, get as any),
      ...createUserSlice(set as any, get as any),
      ...createCoursesSlice(set as any, get as any),
      ...createUISlice(set as any, get as any),
    }),
    { name: "AlgoLearn-Store" }
  )
);

export interface StoreState
  extends AuthState,
    UserState,
    CoursesState,
    UIState {}

export type SliceCreator<TSlice> = StateCreator<StoreState, [], [], TSlice>;
export type SetState<T> = Parameters<StateCreator<StoreState, [], [], T>>[0];
export type GetState<T> = () => T;
