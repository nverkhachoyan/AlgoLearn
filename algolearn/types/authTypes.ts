import { User } from "./userTypes";

export type AuthContextType = {
  user: User | undefined;
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
};
