import { Stack } from "expo-router";

export default function CourseLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[courseId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
