import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function PublicLayout() {
  const { colors }: { colors: Colors } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="preferences" />
        </Stack>
      </SafeAreaView>
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
