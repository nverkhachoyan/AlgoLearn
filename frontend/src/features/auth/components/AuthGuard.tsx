import { useEffect } from "react";
import { useSegments, router } from "expo-router";
import { useAuth } from "../context/AuthContext";

export function AuthGuard() {
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const currentGroup = segments[0];
    const inAuthGroup = currentGroup === "(auth)";
    const inPublicGroup = currentGroup === "(public)";
    const inProtectedGroup = currentGroup === "(protected)";

    if (isAuthenticated) {
      // Redirect to protected area if user is in auth/public pages
      if (inAuthGroup || inPublicGroup) {
        router.replace("/(protected)/(tabs)");
      }
    } else {
      // Redirect to auth if user tries to access protected pages
      if (inProtectedGroup) {
        router.replace("/(auth)");
      }
    }
  }, [isLoading, isAuthenticated, segments]);

  return null;
}
