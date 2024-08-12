import React, { useEffect, ReactNode, createContext, useContext } from "react";
import { useUser, UseUserReturn } from "@/hooks/useUser";
import { router, usePathname } from "expo-router";

export interface AuthContextType extends UseUserReturn {}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const userContext = useUser();
  const { token, isAuthed, checkAuthState } = userContext;
  const pathname = usePathname();

  // useEffect(() => {
  //   if (!isAuthed && pathname.startsWith("(tabs)")) {
  //     // Adjust the pathname condition
  //     router.replace("/unauthorized");
  //   }
  // }, [isAuthed, pathname]);

  useEffect(() => {
    checkAuthState();
  }, []);

  console.log("isAuthed: ", isAuthed);
  console.log("user: ", userContext.user);

  return (
    <AuthContext.Provider
      value={{
        ...userContext,
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
