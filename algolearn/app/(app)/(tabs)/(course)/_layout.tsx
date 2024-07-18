import { Stack, useSegments } from "expo-router";

export default function Layout() {
  const segments = useSegments();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CourseDetails" />
      <Stack.Screen name="ModuleSession" />
    </Stack>
  );
}
