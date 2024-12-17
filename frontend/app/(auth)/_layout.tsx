// app/(public)/_layout.tsx
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { Stack, router } from "expo-router";
import { useUser } from "@/src/features/user/hooks/useUser";
import { useEffect } from "react";
import { ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
export default function AuthLayout() {
  const { isAuthenticated, isLoading, token, user, isUserPending } = useUser();
  const { colors }: { colors: Colors } = useTheme();

  useEffect(() => {
    let mounted = true;

    // Only redirect when we have both token and user data
    if (!isLoading && token && user && mounted) {
      // Use setTimeout to ensure navigation happens after layout is mounted
      const timer = setTimeout(() => {
        console.log("Auth state verified, redirecting to protected tabs...");
        router.replace("/(protected)/(tabs)");
      }, 100);

      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
  }, [isLoading, token, user]);

  // Show loading state while checking auth
  if (isLoading || (token && isUserPending)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Don't render auth screens if already authenticated
  if (isAuthenticated) {
    return null;
  }

  // Only render auth screens if not authenticated
  return <Stack screenOptions={{ headerShown: false }} />;
}
