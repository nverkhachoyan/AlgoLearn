import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useRouter, useSegments } from "expo-router";
import Button from "@/src/components/common/Button";
import { Feather } from "@expo/vector-icons";
import { useUser } from "@/src/hooks/useUser";

import { useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
import useToast from "@/src/hooks/useToast";

export default function SignUp() {
  const router = useRouter();
  const { isAuthed, isInitialized, checkEmail, signIn } = useUser();
  const colorScheme = useColorScheme();
  const { colors } = useTheme();
  const [hasCheckedEmail, setHasCheckedEmail] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retryPassword, setRetryPassword] = useState<string>("");
  const { showToast } = useToast();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  //TODO: Fix
  const signUp = {};
  const signInWithGoogle = () => {};

  const handleEmailCheck = async () => {
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address.");
    } else {
      checkEmail.mutate(email, {
        onSuccess: (res: any) => {
          //          console.log("RES", res);
          //          console.log("res.data", res.data);

          if (true) {
            setHasCheckedEmail(true);
            setEmailExists(true);
          }
        },
        onError: (error: any) => {
          showToast(`Error checking email: ${error.message}`);
        },
      });
    }
  };

  //TODO: Fix
  const handleSignUp = () => {
    // if (password.length < 8) {
    //   Alert.alert(
    //     "Weak Password",
    //     "Password must be at least 8 characters long."
    //   );
    //   return;
    // }
    // if (password !== retryPassword) {
    //   Alert.alert("Password Mismatch", "Passwords do not match.");
    // } else {
    //   signUp.mutate(
    //     { email, password },
    //     {
    //       onSuccess: () => {
    //         router.navigate("/userdetails");
    //       },
    //       onError: (err: any) => {
    //         showToast(`${err.response.message}`);
    //       },
    //     }
    //   );
    // }
  };

  const handleSignIn = () => {
    signIn.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.navigate("/(auth)/sign-up");
        },
        onError: (err: any) => {
          if (err.response.status === 401) {
            showToast("Incorrect email or password.");
          }
        },
      }
    );
  };

  const handleContinue = () => {
    if (checkEmail.isPending) return null;
    if (emailExists === false) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={colors.onSurface} />
      </Pressable>
      <Text style={[styles.title, { color: colors.onSurface }]}>
        Log in or sign up to AlgoLearn
      </Text>

      {/* SIGN-IN OR SIGN-UP FORM */}
      <View style={styles.middleContent}>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.shadow,
              color: colors.onSurface,
            },
          ]}
          placeholder="Email"
          placeholderTextColor={colors.secondary}
          value={email}
          onChangeText={(newEmail) => setEmail(newEmail)}
          autoCapitalize="none"
        />

        {hasCheckedEmail && (
          <>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.shadow,
                  color: colors.onSurface,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.secondary}
              value={password}
              onChangeText={(newPassword) => setPassword(newPassword)}
              autoCapitalize="none"
              secureTextEntry
            />
            {!emailExists && (
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: colors.shadow,
                    color: colors.onSurface,
                  },
                ]}
                placeholder="Retype password"
                placeholderTextColor={colors.secondary}
                value={retryPassword}
                onChangeText={(newRetryPassword) =>
                  setRetryPassword(newRetryPassword)
                }
                autoCapitalize="none"
                secureTextEntry
              />
            )}
            <Button
              title="Continue"
              onPress={handleContinue}
              icon={{ name: "arrow-right", position: "right" }}
              textStyle={{ color: colors.onSurface }}
              iconStyle={{
                position: "absolute",
                right: 12,
                color: colors.onSurface,
              }}
              style={{
                backgroundColor: colors.background,
              }}
            />
          </>
        )}

        {!hasCheckedEmail && (
          <Button
            title="Continue"
            onPress={handleEmailCheck}
            icon={{ name: "arrow-right", position: "right" }}
            textStyle={{ color: colors.onSurface }}
            iconStyle={{
              position: "absolute",
              right: 12,
              color: colors.onSurface,
            }}
            style={{
              backgroundColor: colors.background,
            }}
          />
        )}
      </View>

      {/* SEPARATOR */}
      <View style={styles.dividerContainer}>
        <View style={[styles.line, { backgroundColor: colors.onSurface }]} />
        <Text style={[styles.orText, { color: colors.onSurface }]}>or</Text>
        <View style={[styles.line, { backgroundColor: colors.onSurface }]} />
      </View>

      {/* GOOGLE OAUTH BUTTON */}
      <View style={styles.buttonContainer}>
        <Button
          title="Continue with Google"
          onPress={signInWithGoogle}
          icon={{
            name: "google",
            position: "left",
            type: "png",
            src: require("@/assets/icons/google.png"),
          }}
          iconStyle={{ width: 20, height: 20 }}
          style={{
            backgroundColor:
              (colorScheme ?? "light" === "light") ? "white" : "black",
            borderColor: colors.shadow,
            borderWidth: 1,
          }}
          textStyle={{
            color: "#666",
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 25,
    paddingRight: 25,
  },
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 20,
    left: 0,
    zIndex: 1,
  },
  titleContainer: {
    marginTop: 100,
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  middleContent: {
    flex: 1,
    justifyContent: "center",
    marginTop: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    marginTop: 70,
    marginBottom: 30,
  },
  textInput: {
    height: 45,
    padding: 10,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 16,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  line: {
    height: 1,
    flex: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});
