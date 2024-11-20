import { StyleSheet } from "react-native";

import { Text, View } from "@/components/Themed";
import Button from "@/components/common/Button";
import { useAuthContext } from "@/context/AuthProvider";
import { router } from "expo-router";
import useTheme from "@/hooks/useTheme";

export default function Challenges() {
  const {colors} = useTheme();
  
  return (
    <View style={[styles.container, {
      backgroundColor: colors.background
    }]}>
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
