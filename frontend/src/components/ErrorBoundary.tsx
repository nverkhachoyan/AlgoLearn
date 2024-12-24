import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTheme } from "react-native-paper";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.debug("[ErrorBoundary] Caught error:", error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary] Error details:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={[styles.container, { backgroundColor: "red" }]}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>{this.state.error?.message}</Text>
          <Pressable
            style={styles.button}
            onPress={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      );
    }

    console.debug("[ErrorBoundary] Rendering children");
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    marginBottom: 16,
    textAlign: "center",
    color: "#666",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
