import { StyleSheet } from "react-native";

import { Text, View } from "@/src/components/Themed";
import Button from "@/src/components/common/Button";
import { useAuthContext } from "@/src/context/AuthProvider";
import { router } from "expo-router";
import useTheme from "@/src/hooks/useTheme";

export default function Challenges() {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Text style={styles.title}>Challenges</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
