export type AuthContextType = {
  signOut: () => void;
  signInWithGoogle: () => Promise<void>;
  isAuthed: boolean;
  loading: boolean;
  checkEmailMutate: (email: string) => void;
  doesEmailExist: null | boolean;
  signInMutate: ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => void;
};
