import React, { useRef } from "react";
import { Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import Button from "@/src/components/common/Button";
import LottieView from "lottie-react-native";
import { View } from "@/src/components/Themed";
import useTheme from "@/src/hooks/useTheme";

export default function Welcome() {
  const { colors } = useTheme();

  const animation = useRef(null);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.middleContent}>
        <LottieView
          autoPlay={true}
          loop={false}
          ref={animation}
          style={styles.logo}
          source={require("@/assets/lotties/AlgoLearnLogo.json")}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          Master programming with bite-sized content
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Learn programming at your own pace with lessons that are{" "}
          <Text style={styles.italic}>fun</Text> and{" "}
          <Text style={styles.italic}>rewarding</Text>.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => router.navigate("(auth)/signup" as any)}
          icon={{ name: "arrow-right", position: "right" }}
          iconStyle={{
            position: "absolute",
            right: 12,
            color: colors.buttonText,
          }}
          style={{
            backgroundColor: colors.buttonBackground,
          }}
          textStyle={{ color: colors.buttonText }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 25,
    paddingRight: 25,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
  },
  italic: {
    fontStyle: "italic",
  },
  buttonContainer: {
    width: "100%",
    justifyContent: "center",
  },
});
