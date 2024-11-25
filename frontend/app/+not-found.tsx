import { Link, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Text } from "react-native-paper";
import { useColorScheme } from "react-native";

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View
        style={[
          styles.container,
          { backgroundColor: colorScheme === "dark" ? "#000" : "#FFF" },
        ]}
      >
        <Text
          style={[
            styles.title,
            { color: colorScheme === "dark" ? "#FFF" : "#000" },
          ]}
        >
          This screen doesn't exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
