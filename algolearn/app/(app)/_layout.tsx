import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect } from "react";
import useTheme from "@/hooks/useTheme";
export { ErrorBoundary } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Layout() {
  const { colors } = useTheme();
  const [loaded, error] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
    "OpenSauceOne-Italic": require("@/assets/fonts/OpenSauceOne-Italic.ttf"),
    "OpenSauceOne-Regular": require("@/assets/fonts/OpenSauceOne-Regular.ttf"),
    "OpenSauceOne-Bold": require("@/assets/fonts/OpenSauceOne-Bold.ttf"),
    "OpenSauceOne-Black": require("@/assets/fonts/OpenSauceOne-Black.ttf"),
    "OpenSauceOne-Light": require("@/assets/fonts/OpenSauceOne-Light.ttf"),
    "OpenSauceOne-Medium": require("@/assets/fonts/OpenSauceOne-Medium.ttf"),
    "OpenSauceOne-SemiBold": require("@/assets/fonts/OpenSauceOne-SemiBold.ttf"),
    "OpenSauceOne-LightItalic": require("@/assets/fonts/OpenSauceOne-LightItalic.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 0, backgroundColor: colors.secondaryBackground }}
      />
      <SafeAreaView
        edges={["left", "right"]}
        style={{
          flex: 1,
        }}
      >
        <Stack
          screenOptions={{ headerShown: false }}
          initialRouteName="(tabs)/index"
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" options={{ presentation: "modal" }} />
        </Stack>
      </SafeAreaView>
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 0,
          backgroundColor: colors.secondaryBackground,
          // borderRadius: 20,
        }}
      />
    </>
  );
}
