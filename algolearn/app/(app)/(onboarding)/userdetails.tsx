import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Button from "@/components/common/Button";
import { Feather } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthProvider";
import useTheme from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstname] = useState("");
  const [lastName, setLastname] = useState("");
  const router = useRouter();
  const { isAuthed } = useAuthContext();
  const { colors } = useTheme();
  const { updateUser } = useUser();

  if (!isAuthed) {
    router.navigate("/signup");
  }

  const handleUpdateUser = async () => {
    if (!username || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      updateUser.mutate({ username, firstName, lastName });
      router.navigate("/pushnotifications");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Pressable style={styles.goBackButton} onPress={() => router.back()}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>
        Log in or sign up to AlgoLearn
      </Text>
      <View style={styles.middleContent}>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={username}
          placeholder="Username"
          placeholderTextColor={colors.placeholderText}
          onChangeText={(newUsername) => setUsername(newUsername)}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={firstName}
          placeholder="First name"
          placeholderTextColor={colors.placeholderText}
          onChangeText={(newFirstName) => setFirstname(newFirstName)}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.inputBorder,
              color: colors.text,
            },
          ]}
          value={lastName}
          placeholder="Last name"
          placeholderTextColor={colors.placeholderText}
          onChangeText={(newUsername) => setLastname(newUsername)}
          autoCapitalize="none"
        />
        <Button
          title="Save Details"
          onPress={() => {
            handleUpdateUser();
          }}
          icon={{ name: "arrow-right", position: "right" }}
          textStyle={{ color: colors.buttonText }}
          iconStyle={{
            position: "absolute",
            right: 12,
            color: colors.buttonText,
          }}
          style={{
            backgroundColor: colors.buttonBackground,
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
    fontFamily: "OpenSauceOne-SemiBold",
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
});
