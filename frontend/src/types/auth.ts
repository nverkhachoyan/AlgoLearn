export type AuthContextType = {
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
  checkEmailMutate: (email: string) => void;
  doesEmailExist: null | boolean;
  signIn: any;
  signUp: any;
};
