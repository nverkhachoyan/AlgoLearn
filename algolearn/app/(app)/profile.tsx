import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet } from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import { useUser, UseUserReturn } from "@/hooks/useUser";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { Seperator } from "@/components/common/Seperator";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import useTheme from "@/hooks/useTheme";

export default function Profile() {
  const { isAuthed, loading, signOut } = useAuthContext();
  const { user, updateUser, deleteAccount }: UseUserReturn = useUser();

  const { colors } = useTheme();

  const handleSignOut = () => {
    signOut();
    router.replace("/welcome");
  };

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate("/welcome");
    }
  }, [loading, isAuthed, user]);

  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        {user.data.username || user.data.email}
      </Text>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View
        style={[
          styles.userInfoContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <View style={styles.userInfoRow}>
          <Feather name="mail" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            {user.data.email}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="user" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            {user.data.username || "N/A"}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="cpu" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            CPUS: {user.data.cpus}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="tag" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            Role: {user.data.role}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="calendar" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            Account Created:{" "}
            {moment(user.data.created_at).format("MMMM Do YYYY")}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="clock" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            Last Login:{" "}
            {user.data.last_login_at === "0001-01-01T00:00:00Z"
              ? "Never"
              : moment(user.data.last_login_at).format(
                  "MMMM Do YYYY, h:mm:ss a",
                )}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="check-circle" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            Active: {user.data.is_active ? "Yes" : "No"}
          </Text>
        </View>
        <View style={styles.userInfoRow}>
          <Feather name="mail" size={20} color={colors.text} />
          <Text style={[styles.userInfoText, { color: colors.text }]}>
            Email Verified: {user.data.is_email_verified ? "Yes" : "No"}
          </Text>
        </View>
      </View>
      <View style={styles.separator} />
      <Button
        title="Log Out"
        onPress={handleSignOut}
        style={{
          backgroundColor: colors.buttonBackground,
          borderColor: colors.border,
          borderWidth: 1,
          marginBottom: 10,
        }}
        textStyle={{ color: colors.buttonText }}
        icon={{
          name: "log-out",
          position: "right",
        }}
        iconStyle={{ color: colors.buttonText }}
      />

      <Button
        title="Delete Account"
        onPress={() => deleteAccount.mutate()}
        style={{
          backgroundColor: colors.dangerBgColor,
        }}
        textStyle={{ color: colors.dangerTextColor }}
        icon={{
          name: "remove",
          type: "fontawesome",
          position: "right",
        }}
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },
  separator: {
    height: 1,
    width: "80%",
    marginVertical: 5,
  },
  userInfoContainer: {
    width: "90%",
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  userInfoText: {
    fontSize: 16,
    marginLeft: 10,
  },
});
