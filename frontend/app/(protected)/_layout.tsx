import { Stack, router } from "expo-router";
import { useUser } from "@/src/features/user/hooks/useUser";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading, userError } = useUser();
  const { colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        style={{
          flex: 0,
          backgroundColor: colors.surface,
        }}
      />
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 0,
          backgroundColor: colors.surface,
        }}
      />
    </View>
  );
}
