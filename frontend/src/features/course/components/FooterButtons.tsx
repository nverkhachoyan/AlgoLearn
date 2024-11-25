import { View, StyleSheet } from "react-native";
import Button from "@/src/components/common/Button";
import { router } from "expo-router";

export default function FooterButtons({ colors }: any) {
  return (
    <View style={[styles.stickyFooter, { backgroundColor: colors.surface }]}>
      <Button
        icon={{
          name: "arrow-left",
          size: 22,
          color: colors.inverseOnSurface,
          position: "middle",
        }}
        style={{ backgroundColor: colors.onSurface }}
        textStyle={{ color: colors.inverseOnSurface }}
        onPress={() => router.back()}
      />
      <Button
        title="Start Course"
        style={{ backgroundColor: colors.onSurface, width: "70%" }}
        textStyle={{ color: colors.inverseOnSurface }}
        onPress={() => console.log("Start Course")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stickyFooter: {
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
});
