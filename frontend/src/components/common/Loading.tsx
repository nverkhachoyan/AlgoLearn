import { StyleSheet, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "react-native-paper";
import { Colors } from "@/constants/Colors";

export default function Loading() {
  const { colors }: { colors: Colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
