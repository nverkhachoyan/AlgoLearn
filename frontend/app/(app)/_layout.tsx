import { Stack, useSegments, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";
import { useEffect } from "react";
import useTheme from "@/src/hooks/useTheme";
export { useSegments, Href } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@/src/hooks/useUser";
import { Button, Text } from "react-native-paper";
import { View } from "@/src/components/Themed";
import ErrorBoundary from "react-native-error-boundary";
import { DefaultFallback } from "@/src/components/DefaultFallback";

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
  const segments = useSegments();
  const router = useRouter();
  const { isAuthed, isInitialized } = useUser();

  const shouldSafeAreaBeBlack = segments.includes("(auth)" as never);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     await checkAuthState();
  //   };
  //   checkAuth();
  //   if (!isAuthed) {
  //     <Redirect href="/unauthorized" />;
  //   }
  // }, [isAuthed]);

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === "welcome";
    const inProtectedGroup = segments[0] === "(app)";

    if (!isAuthed && inProtectedGroup) {
      router.replace("/(app)/(auth)/signup");
    } else if (isAuthed && inAuthGroup) {
      router.replace("/(app)/(tabs)");
    }
  }, [isAuthed, isInitialized, segments]);

  // useEffect(() => {
  //   if (error) throw error;
  // }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  if (!isInitialized) return null;

  return (
    <>
      <SafeAreaView
        edges={["top"]}
        style={{
          flex: 0,
          backgroundColor: shouldSafeAreaBeBlack
            ? colors.background
            : colors.secondaryBackground,
        }}
      />
      <SafeAreaView
        edges={["left", "right"]}
        style={{
          flex: 1,
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="(tabs)"
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="course" />
          <Stack.Screen name="profile" options={{ presentation: "modal" }} />
          <Stack.Screen name="preferences" />
          <Stack.Screen name="unauthorized" />
        </Stack>
      </SafeAreaView>
      <SafeAreaView
        edges={["bottom"]}
        style={{
          flex: 0,
          backgroundColor: shouldSafeAreaBeBlack
            ? colors.background
            : colors.secondaryBackground,
        }}
      />
    </>
  );
}

// export default function RootLayout() {
//   const segments = useSegments();
//   const router = useRouter();
//   const { isAuthed, isInitialized } = useUser();

//   useEffect(() => {
//     if (!isInitialized) return;

//     const inAuthGroup = segments[0] === '(auth)';
//     const inProtectedGroup = segments[0] === '(app)';

//     if (!isAuthed && inProtectedGroup) {
//       router.replace('/(auth)/sign-in');
//     } else if (isAuthed && inAuthGroup) {
//       router.replace('/(app)/(tabs)');
//     }
//   }, [isAuthed, isInitialized, segments]);

//   if (!isInitialized) return null;

//   return <Slot />;
// }
