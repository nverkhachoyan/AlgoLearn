import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseDetails" />
      <Stack.Screen name="ModuleSession" />
      <Stack.Screen name="SessionTOC" options={{ presentation: "modal" }} />
    </Stack>
  );
}
