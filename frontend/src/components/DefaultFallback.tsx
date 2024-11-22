import { type FallbackProps } from "react-error-boundary";
import { StyleSheet } from "react-native";
import { View, Text } from "./Themed";
import Button from "./common/Button";
import useTheme from "../hooks/useTheme";

export function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button
        title="Try again"
        onPress={resetErrorBoundary}
        style={{ backgroundColor: colors.buttonBackground }}
        textStyle={{ color: colors.buttonText }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    textAlign: "center",
    marginBottom: 20,
  },
});
