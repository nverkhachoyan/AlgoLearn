import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { useColorScheme } from "@/components/useColorScheme";
import { Seperator } from "@/components/common/Seperator";
import moment from "moment";
import Colors from "@/constants/Colors";

export default function Profile() {
  const { user, isAuthed, loading, signOut, deleteAccount } = useAuthContext();
  const colorScheme = useColorScheme();

  const theme = Colors[colorScheme ?? "light"];

  if (loading) {
    return <Text>Loading...</Text>;
  }
  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  const handleSignOut = () => {
    signOut();
    router.replace("welcome");
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>
        {user.username || user.email}
      </Text>
      <View style={[styles.separator, { backgroundColor: theme.border }]} />
      <View
        style={[
          styles.userInfoContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Email: {user.email}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Username: {user.username || "N/A"}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          CPUS: {user.cpus}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Role: {user.role}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Account Created: {moment(user.created_at).format("MMMM Do YYYY")}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Last Login:{" "}
          {user.last_login_at === "0001-01-01T00:00:00Z"
            ? "Never"
            : moment(user.last_login_at).format("MMMM Do YYYY, h:mm:ss a")}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Active: {user.is_active ? "Yes" : "No"}
        </Text>
        <Text style={[styles.userInfoText, { color: theme.text }]}>
          Email Verified: {user.is_email_verified ? "Yes" : "No"}
        </Text>
      </View>
      <Button
        title="Log Out"
        onPress={handleSignOut}
        style={{
          backgroundColor: theme.buttonBackground,
          borderColor: theme.border,
          borderWidth: 1,
        }}
        textStyle={{ color: theme.buttonText }}
      />
      <Seperator />
      <Button
        title="Delete Account"
        onPress={() => deleteAccount()}
        style={{
          backgroundColor: theme.dangerBgColor,
        }}
        textStyle={{ color: theme.buttonText }}
      />
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "80%",
  },
  userInfoContainer: {
    width: "90%",
    marginVertical: 20,
    padding: 15,
  },
  userInfoText: {
    fontSize: 16,
    marginVertical: 5,
  },
  button: {
    width: "90%",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
});
