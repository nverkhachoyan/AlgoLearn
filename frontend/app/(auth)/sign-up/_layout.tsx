import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

export default function Layout() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        style={{
          flex: 0,
          backgroundColor: colors.background,
        }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="courses" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
      </Stack>
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 0,
          backgroundColor: colors.background,
        }}
      />
    </View>
  );
}
