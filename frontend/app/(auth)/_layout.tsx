import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { useUser } from "@/src/features/user/hooks/useUser";
import { ActivityIndicator } from "react-native";
import { Colors } from "@/constants/Colors";
export default function AuthLayout() {
  const { isAuthenticated, isLoading, token, user, isUserPending } = useUser();
  const { colors }: { colors: Colors } = useTheme();

  if (isLoading || (token && isUserPending)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
