import React, { useRef, useEffect, useState } from "react";
import { Text, StyleSheet, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import Button from "@/src/components/common/Button";
import LottieView from "lottie-react-native";
import { useTheme } from "react-native-paper";
import { useAuth } from "@/src/features/auth/context/AuthContext";
import { Colors } from "@/constants/Colors";
import CustomErrorBoundary from "@/src/components/ErrorBoundary";

export default function Welcome() {
  const { colors }: { colors: Colors } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const animation = useRef(null);
  const { isLoading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (isLoading || !isMounted) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <CustomErrorBoundary>
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
            onPress={() => {
              if (isMounted) {
                router.push("/(auth)");
              }
            }}
            icon={{ name: "arrow-right", position: "right" }}
            iconStyle={{
              position: "absolute",
              right: 12,
              color: colors.inverseOnSurface,
            }}
            style={{
              backgroundColor: colors.onBackground,
            }}
            textStyle={{ color: colors.inverseOnSurface }}
          />
        </View>
      </View>
    </CustomErrorBoundary>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
