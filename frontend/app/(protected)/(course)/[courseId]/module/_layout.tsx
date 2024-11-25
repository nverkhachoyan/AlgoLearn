import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[moduleId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
