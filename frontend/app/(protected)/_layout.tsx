import { Stack, router } from "expo-router";
import { useUser } from "@/src/hooks/useUser";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading, userError } = useUser();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || userError)) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, isAuthenticated, userError]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated || userError) {
    return null; // Will redirect in useEffect
  }

  return <Stack />;
}
