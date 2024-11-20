import { View } from "@/components/Themed";
import { StyleSheet } from "react-native";
import Button from "@/components/common/Button";
import { router } from "expo-router";

export default function FooterButtons({ colors }: any) {
  return (
    <View
      style={[
        styles.stickyFooter,
        { backgroundColor: colors.secondaryBackground },
      ]}
    >
      <Button
        icon={{
          name: "arrow-left",
          size: 22,
          color: colors.buttonText,
          position: "middle",
        }}
        style={{ backgroundColor: colors.buttonBackground }}
        textStyle={{ color: colors.buttonText }}
        onPress={() => router.back()}
      />
      <Button
        title="Start Course"
        style={{ backgroundColor: colors.buttonBackground, width: "70%" }}
        textStyle={{ color: colors.buttonText }}
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
