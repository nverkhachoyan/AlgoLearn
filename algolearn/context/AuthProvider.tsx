import React, { useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import {
  tokenAtom,
  isAuthedAtom,
  userAtom,
  deleteAccountAtom,
  signOutAtom,
  handleSuccessAtom,
  checkAuthStateAtom,
} from "@/atoms/userAtoms";
import { AuthContextType } from "@/types/authTypes";
import { createContext, useContext, ReactNode } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token] = useAtom(tokenAtom);
  const [isAuthed] = useAtom(isAuthedAtom);
  const [{ data: user }] = useAtom(userAtom);
  const [{ mutate: deleteAccount }] = useAtom(deleteAccountAtom);
  const [, signOut] = useAtom(signOutAtom);
  const [, handleSuccess] = useAtom(handleSuccessAtom);
  const [, checkAuthState] = useAtom(checkAuthStateAtom);

  const handleError = useCallback(
    (error: Error) => {
      console.error("Authentication error:", error);
      signOut();
    },
    [signOut],
  );

  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    await promptAsync();
  }, [promptAsync]);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signOut,
        isAuthed,
        loading: !isAuthed && !!token,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
