import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Image } from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import { useUser, UseUserReturn } from "@/hooks/useUser";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
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
    if (user.error) {
      console.log("Error while fetching user", user.error.message);
    }
  }, [user, user.error]);

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
      <View style={styles.profileHeader}>
        <Image
          source={{
            uri:
              user.data.profile_picture_url ||
              "https://picsum.photos/id/64/4326/2884",
          }}
          style={styles.profilePicture}
        />
        <Text style={[styles.title, { color: colors.text }]}>
          {user.data.username || user.data.email}
        </Text>
        <Text style={[styles.bio, { color: colors.text }]}>
          {user.data.bio || "No bio available"}
        </Text>
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View
        style={[
          styles.userInfoContainer,
          { backgroundColor: colors.cardBackground },
        ]}
      >
        <UserInfoRow icon="mail" label="Email" value={user.data.email} />
        <UserInfoRow
          icon="user"
          label="Username"
          value={user.data.username || "N/A"}
        />
        <UserInfoRow icon="cpu" label="CPUS" value={`${user.data.cpus}`} />
        <UserInfoRow icon="tag" label="Role" value={`${user.data.role}`} />
        <UserInfoRow
          icon="calendar"
          label="Created"
          value={moment(user.data.created_at).format("MMMM Do YYYY")}
        />
        <UserInfoRow
          icon="clock"
          label="Last Login"
          value={
            user.data.last_login_at === "0001-01-01T00:00:00Z"
              ? "Never"
              : moment(user.data.last_login_at).format(
                  "MMMM Do YYYY, h:mm:ss a",
                )
          }
        />
        <UserInfoRow
          icon="check-circle"
          label="Active"
          value={user.data.is_active ? "Yes" : "No"}
        />
        <UserInfoRow
          icon="check-circle"
          label="Email Verified"
          value={user.data.is_email_verified ? "Yes" : "No"}
        />
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <Button
        onPress={() => router.replace("/preferences")}
        style={{
          backgroundColor: colors.buttonBackground,
          borderColor: colors.border,
          paddingHorizontal: 15,
        }}
        textStyle={{ color: colors.buttonText }}
        icon={{ name: "settings", position: "middle" }}
        iconStyle={{ color: colors.buttonText }}
      />
      <View style={styles.separator} />
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

function UserInfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.userInfoRow}>
      <Feather name={icon} size={20} color={colors.icon} />
      <Text style={[styles.userInfoLabel, { color: colors.text }]}>
        {label}:
      </Text>
      <Text style={[styles.userInfoText, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    fontStyle: "italic",
  },
  separator: {
    height: 1,
    width: "80%",
    marginVertical: 10,
  },
  userInfoContainer: {
    width: "90%",
    marginVertical: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  userInfoLabel: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: "bold",
  },
  userInfoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  button: {
    borderWidth: 1,
    marginBottom: 10,
    width: "80%",
  },
});
