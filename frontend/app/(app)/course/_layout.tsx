import { Stack } from "expo-router";
import ErrorBoundary from "react-native-error-boundary";
import { DefaultFallback } from "@/src/components/DefaultFallback";

export default function CourseLayout() {
  return (
    <ErrorBoundary
      FallbackComponent={(error, resetErrorBoundary) =>
        DefaultFallback({ error, resetErrorBoundary })
      }
    >
      <Stack>
        <Stack.Screen
          name="[courseId]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ErrorBoundary>
  );
}
