import { User } from "./userTypes";
import { UseMutateFunction } from "@tanstack/react-query";

export type AuthContextType = {
  user: User | undefined;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
  deleteAccount: any;
};
