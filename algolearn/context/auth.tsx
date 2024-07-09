import React, { useEffect, useCallback, useState } from "react";
import { useAtom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { tokenAtom, isAuthedAtom, userAtom } from "@/atoms/authAtoms"; // Adjust the import path as needed
import { AuthContextType } from "@/types/authTypes";
import { createContext, useContext, ReactNode } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useAtom(tokenAtom);
  const [isAuthed, setIsAuthed] = useAtom(isAuthedAtom);
  const [{ data: user, refetch: refetchUser, isFetching: loadingUserFetch }] =
    useAtom(userAtom);
  const [loading, setLoading] = useState<boolean>(true);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem("authToken");
    setToken(null);
    setIsAuthed(false);
  }, [setToken, setIsAuthed]);

  const handleSuccess = useCallback(
    async (token: string) => {
      setToken(token);
      await AsyncStorage.setItem("authToken", token);
      setIsAuthed(true);
      refetchUser();
    },
    [setToken, setIsAuthed, refetchUser],
  );

  const handleError = useCallback(
    (error: Error) => {
      console.error("Authentication error:", error);
      signOut();
    },
    [signOut],
  );

  const { promptAsync } = useGoogleAuth(handleSuccess, handleError);

  const signInWithGoogle = useCallback(async () => {
    promptAsync();
  }, [promptAsync]);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const authToken = await AsyncStorage.getItem("authToken");
        if (authToken) {
          setToken(authToken);
          setIsAuthed(true);
          refetchUser();
        }
      } catch (error) {
        console.error("Failed to check auth state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthState();
  }, [setToken, setIsAuthed, refetchUser]);

  useEffect(() => {
    if (!loadingUserFetch) {
      setLoading(false);
    }
  }, [loadingUserFetch]);

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signOut,
        isAuthed,
        loading,
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
