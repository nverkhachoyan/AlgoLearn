import React, { useRef, useEffect } from "react";
import { Text, StyleSheet, View } from "react-native";
import { router, useSegments, useRouter } from "expo-router";
import Button from "@/src/components/common/Button";
import LottieView from "lottie-react-native";
import { useTheme } from "react-native-paper";
import { useUser } from "@/src/hooks/useUser";

export default function Welcome() {
  const { colors } = useTheme();

  const animation = useRef(null);
  const segments = useSegments();
  const router = useRouter();
  const { isAuthed, isInitialized } = useUser();

  useEffect(() => {
    if (!isInitialized) return;

    // Get the current group (first segment)
    const currentGroup = segments[0];

    if (isAuthed) {
      // If user is authenticated but in auth/public areas, redirect to protected
      if (currentGroup === "(auth)" || currentGroup === "(public)") {
        router.replace("/(protected)/(tabs)");
      }
    } else {
      // If user is not authenticated and tries to access protected routes
      if (currentGroup === "(protected)") {
        router.replace("/(auth)");
      }
    }
  }, [isAuthed, isInitialized, segments]);

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
        <Text style={[styles.title, { color: colors.onSurface }]}>
          Master programming with bite-sized content
        </Text>
        <Text style={[styles.subtitle, { color: colors.onSurface }]}>
          Learn programming at your own pace with lessons that are{" "}
          <Text style={styles.italic}>fun</Text> and{" "}
          <Text style={styles.italic}>rewarding</Text>.
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Get Started"
          onPress={() => router.navigate("/(auth)" as any)}
          icon={{ name: "arrow-right", position: "right" }}
          iconStyle={{
            position: "absolute",
            right: 12,
            color: colors.onSurface,
          }}
          style={{
            backgroundColor: colors.background,
          }}
          textStyle={{ color: colors.onSurface }}
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
