import { User } from './userTypes';

export type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  handleSignOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
};
