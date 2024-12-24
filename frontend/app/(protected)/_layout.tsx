import { Stack } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";

export default function ProtectedLayout() {
  const { colors } = useTheme();

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
        <View style={{ flex: 1, backgroundColor: "#333333" }}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
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
