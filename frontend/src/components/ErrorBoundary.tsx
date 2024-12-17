import ErrorBoundary from "react-native-error-boundary";
import { View, Text, Button } from "react-native";

const ErrorFallback = ({
  error,
  resetError,
}: {
  error: Error;
  resetError: () => void;
}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>
        Something went wrong! ErrorBoundary Caught this error.
      </Text>
      <Text style={{ fontSize: 14, marginBottom: 16, color: "red" }}>
        {error.toString()}
      </Text>
      <Button onPress={resetError} title="Try again" />
    </View>
  );
};

export default function CustomErrorBoundary({ children }: any) {
  const handleError = (error: Error) => {
    console.log("CustomErrorBoundary");
    console.log("An error occurred:", error);
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
}
