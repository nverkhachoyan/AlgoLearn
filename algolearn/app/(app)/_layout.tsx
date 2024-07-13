import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";

import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";

import { useColorScheme } from "@/components/useColorScheme";
import { useEffect } from "react";
export { ErrorBoundary } from "expo-router";

export default function Layout() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="(tabs)/index"
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="profile" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
