import { StyleSheet } from "react-native";
import { Text, View, ScrollView } from "@/components/Themed";
import Button from "@/components/common/Button";
import { useAuthContext } from "@/context/AuthProvider";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Seperator } from "@/components/common/Seperator";
import React from "react";
import moment from "moment";

export default function Inbox() {
  const { user, isAuthed, loading, signOut } = useAuthContext();
  const colorScheme = useColorScheme();

  if (loading) {
    return <Text style={styles.loadingText}>Loading...</Text>;
  }

  if (!isAuthed || !user) {
    return <Text style={styles.notLoggedInText}>Not logged in</Text>;
  }

  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <View style={styles.container}>
        <Text
          style={[styles.title, { color: Colors[colorScheme ?? "light"].text }]}
        >
          Inbox
        </Text>
        <Seperator />
        <View style={styles.userInfoContainer}>
          <Text style={styles.userInfoText}>Email: {user.email}</Text>
          <Text style={styles.userInfoText}>
            Username: {user.username || "N/A"}
          </Text>
          <Text style={styles.userInfoText}>CPUS: {user.cpus}</Text>
          <Text style={styles.userInfoText}>Role: {user.role}</Text>
          <Text style={styles.userInfoText}>
            Account Created: {moment(user.created_at).format("MMMM Do YYYY")}
          </Text>
          <Text style={styles.userInfoText}>
            Last Login:{" "}
            {user.last_login_at === "0001-01-01T00:00:00Z"
              ? "Never"
              : moment(user.last_login_at).format("MMMM Do YYYY, h:mm:ss a")}
          </Text>
          <Text style={styles.userInfoText}>
            Active: {user.is_active ? "Yes" : "No"}
          </Text>
          <Text style={styles.userInfoText}>
            Email Verified: {user.is_email_verified ? "Yes" : "No"}
          </Text>
        </View>
        <Button
          title="Log Out"
          onPress={() => {
            signOut();
          }}
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].buttonBackground,
            borderColor: Colors[colorScheme ?? "light"].border,
            borderWidth: 1,
          }}
          textStyle={{ color: Colors[colorScheme ?? "light"].buttonText }}
        />
        <Seperator />
        <Button
          title="Delete Account"
          onPress={() => {
            signOut();
          }}
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].dangerBgColor,
          }}
          textStyle={{ color: Colors[colorScheme ?? "light"].buttonText }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colors.light.text,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.light.text,
  },
  notLoggedInText: {
    fontSize: 18,
    color: Colors.light.dangerBgColor,
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  userInfoContainer: {
    marginVertical: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 5,
    backgroundColor: Colors.light.background,
    width: "90%",
  },
  userInfoText: {
    fontSize: 16,
    color: Colors.light.text,
    marginVertical: 5,
  },
  button: {
    width: "90%",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
  },
  dangerButton: {
    borderColor: Colors.light.dangerBgColor,
  },
});
