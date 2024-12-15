import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import {
  Platform,
  AppState,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { RootSiblingParent } from "react-native-root-siblings";
import { PaperProvider } from "react-native-paper";
import { useFonts } from "expo-font";
import { FontAwesome6 } from "@expo/vector-icons";
import { SplashScreen } from "expo-router";
import { ThemeProvider, useAppTheme } from "@/src/context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useUser } from "@/src/hooks/useUser";
import { StatusBar } from "expo-status-bar";

// Initialize QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      refetchOnWindowFocus: Platform.OS === "web",
      refetchOnReconnect: "always",
    },
  },
});

focusManager.setEventListener((handleFocus) => {
  const subscription = AppState.addEventListener("change", (state) => {
    handleFocus(state === "active");
  });
  return () => subscription.remove();
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { theme, themeVersion } = useAppTheme();

  return (
    <PaperProvider theme={theme} key={themeVersion}>
      <RootSiblingParent>
        <MainContent />
      </RootSiblingParent>
    </PaperProvider>
  );
}

function MainContent() {
  const [fontsLoaded, error] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome6.font,
    "OpenSauceOne-Italic": require("@/assets/fonts/OpenSauceOne-Italic.ttf"),
    "OpenSauceOne-Regular": require("@/assets/fonts/OpenSauceOne-Regular.ttf"),
    "OpenSauceOne-Bold": require("@/assets/fonts/OpenSauceOne-Bold.ttf"),
    "OpenSauceOne-Black": require("@/assets/fonts/OpenSauceOne-Black.ttf"),
    "OpenSauceOne-Light": require("@/assets/fonts/OpenSauceOne-Light.ttf"),
    "OpenSauceOne-Medium": require("@/assets/fonts/OpenSauceOne-Medium.ttf"),
    "OpenSauceOne-SemiBold": require("@/assets/fonts/OpenSauceOne-SemiBold.ttf"),
    "OpenSauceOne-LightItalic": require("@/assets/fonts/OpenSauceOne-LightItalic.ttf"),
  });

  const { isLoading } = useUser();
  const { theme } = useAppTheme();
  const isDarkMode = theme.dark;

  useEffect(() => {
    if (error) console.error("Error loading fonts:", error);
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(public)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(protected)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
