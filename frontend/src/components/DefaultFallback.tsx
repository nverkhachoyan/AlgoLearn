import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Button from "./common/Button";
import { useTheme } from "react-native-paper";
import { useEffect } from "react";
import useToast from "@/src/hooks/useToast";

export function DefaultFallback({ error, resetErrorBoundary }: any) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.secondaryContainer }]}
    >
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Button
        title="Try again"
        onPress={resetErrorBoundary}
        style={{ backgroundColor: colors.onBackground }}
        textStyle={{ color: colors.onBackground }}
      />
    </View>
  );
}

export function ErrorFallback({ error }: { error: Error }) {
  const { showToast } = useToast();
  useEffect(() => {
    showToast(error.message, {
      position: 20,
      onHide: () => console.log("hiding"),
    });
  }, [error]);

  return null;
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
