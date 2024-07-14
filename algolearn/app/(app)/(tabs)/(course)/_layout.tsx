import { Stack, useSegments } from "expo-router";

export default function Layout() {
  const segments = useSegments();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="course_details" />
      <Stack.Screen name="module_session" />
    </Stack>
  );
}
