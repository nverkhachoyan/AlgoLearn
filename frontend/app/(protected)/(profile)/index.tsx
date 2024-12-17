import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, Image, View } from "react-native";
import { Text } from "react-native-paper";
import { useUser } from "@/src/features/user/hooks/useUser";
import Button from "@/src/components/common/Button";
import { router } from "expo-router";
import moment from "moment";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { useTheme } from "react-native-paper";
import { HeaderGoBack } from "@/src/components/common/StickyHeader";
import { ScrollView } from "react-native";
import { EmptyFooter } from "@/src/components/common/Footer";

type IconType = React.ComponentProps<typeof Feather>["name"];

export default function Profile() {
  const { isAuthenticated, user, userError, signOut } = useUser();
  const { colors } = useTheme();

  const handleSignOut = () => {
    signOut.mutate();
    router.replace("/");
  };

  useEffect(() => {
    if (userError) {
      console.log("Error while fetching user", userError.message);
    }
  }, [user, userError]);

  if (!isAuthenticated || !user) {
    return <Text>Not logged in</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderGoBack title="Profile" />
      <ScrollView contentContainerStyle={[styles.scrollView, { flexGrow: 1 }]}>
        <View style={styles.profileHeader}>
          <Image
            source={
              user.profilePictureUrl
                ? {
                    uri: user.profilePictureUrl,
                  }
                : require("@/assets/images/defaultAvatar.png")
            }
            style={styles.profilePicture}
          />
          {user.firstName || user.lastName ? (
            <Text style={[styles.fullName, { color: colors.onSurface }]}>
              {user.firstName + " " + user.lastName}
            </Text>
          ) : null}

          <Text style={[styles.username, { color: colors.onSurface }]}>
            {"@" + user.username || user.email}
          </Text>
          <Text style={[styles.bio, { color: colors.onSurface }]}>
            {user.bio || "No bio available"}
          </Text>
        </View>

        <View style={[styles.separator, { backgroundColor: colors.shadow }]} />

        <View
          style={[
            styles.userInfoContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          <UserInfoRow icon="mail" label="Email" value={user.email} />
          <UserInfoRow
            icon="user"
            label="Username"
            value={user.username || "N/A"}
          />
          <UserInfoRow icon="cpu" label="CPUS" value={`${user.cpus}`} />
          <UserInfoRow
            icon="tag"
            label="Role"
            value={
              `${user.role}`.charAt(0).toUpperCase() + `${user.role}`.slice(1)
            }
          />
          <UserInfoRow
            icon="calendar"
            label="Created"
            value={moment(user.createdAt).format("MMMM Do YYYY")}
          />
          <UserInfoRow
            icon="clock"
            label="Last Login"
            value={
              user.lastLoginAt === "0001-01-01T00:00:00Z"
                ? "Never"
                : moment(user.lastLoginAt).format("MMMM Do YYYY, h:mm:ss a")
            }
          />
          <UserInfoRow
            icon="check-circle"
            label="Active"
            value={user.isActive ? "Yes" : "No"}
          />
          <UserInfoRow
            icon="check-circle"
            label="Email Verified"
            value={user.isEmailVerified ? "Yes" : "No"}
          />
        </View>

        <View style={[styles.separator, { backgroundColor: colors.shadow }]} />

        <Button
          title="Account Settings"
          onPress={() => router.replace("/preferences")}
          style={{
            backgroundColor: colors.onBackground,
            borderColor: colors.shadow,
            paddingHorizontal: 15,
          }}
          icon={{ name: "settings", position: "right" }}
          iconStyle={{ color: colors.inverseOnSurface }}
          textStyle={{ color: colors.inverseOnSurface }}
        />
        <View style={styles.separator} />
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
      {/* <EmptyFooter /> */}
    </View>
  );
}

function UserInfoRow({
  icon,
  label,
  value,
}: {
  icon: IconType;
  label: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.userInfoRow}>
      <Feather name={icon} size={20} color={colors.onSurface} />
      <Text style={[styles.userInfoLabel, { color: colors.onSurface }]}>
        {label}:
      </Text>
      <Text style={[styles.userInfoText, { color: colors.onSurface }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  profileHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  fullName: {
    fontSize: 28,
    fontWeight: "bold",
  },
  username: {
    fontSize: 15,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  bio: {
    fontSize: 16,
    fontStyle: "italic",
    marginVertical: 15,
  },
  separator: {
    height: 1,
    width: "100%",
    marginVertical: 10,
  },
  userInfoContainer: {
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
    marginHorizontal: 15,
    borderWidth: 1,
  },
});
