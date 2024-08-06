import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Text, View } from "@/components/Themed";
import { useAuthContext } from "@/context/AuthProvider";
import { useUser, UseUserReturn } from "@/hooks/useUser";
import Button from "@/components/common/Button";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import useTheme from "@/hooks/useTheme";
import LabeledInput from "@/components/common/LabeledInput";
import { StickyHeaderSimple } from "@/components/common/StickyHeader";

interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profilePictureURL?: string;
  bio?: string;
  location?: string;
  preferences?: JSON;
}

export default function Preferences() {
  const { isAuthed, loading, signOut } = useAuthContext();
  const { user, updateUser, deleteAccount }: UseUserReturn = useUser();
  const { colors } = useTheme();

  const [formData, setFormData] = useState<UpdateUserData>({
    username: user?.data.username,
    email: user?.data.email,
    firstName: user?.data.first_name,
    lastName: user?.data.last_name,
    profilePictureURL: user?.data.profile_picture_url,
    bio: user?.data.bio,
    location: user?.data.location,
  });

  const handleSignOut = () => {
    signOut();
    router.replace("/welcome");
  };

  const handleSave = () => {
    updateUser.mutate(formData);
  };

  useEffect(() => {
    if (!loading && !isAuthed && !user) {
      router.navigate("/welcome");
    }
  }, [loading, isAuthed, user]);

  if (!isAuthed || !user) {
    return <Text>Not logged in</Text>;
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StickyHeaderSimple>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={18} color={colors.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}> Account Preferences </Text>
        </View>
      </StickyHeaderSimple>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: colors.background },
        ]}
      >
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

        <View style={styles.form}>
          <LabeledInput
            label="Username"
            icon="user"
            placeholder="Username"
            value={formData.username || ""}
            onChangeText={(text) => handleChange("username", text)}
          />
          <LabeledInput
            label="Email"
            icon="mail"
            placeholder="Email"
            value={formData.email || ""}
            onChangeText={(text) => handleChange("email", text)}
            keyboardType="email-address"
          />
          <LabeledInput
            label="First Name"
            icon="user"
            placeholder="First Name"
            value={formData.firstName || ""}
            onChangeText={(text) => handleChange("firstName", text)}
          />
          <LabeledInput
            label="Last Name"
            icon="user"
            placeholder="Last Name"
            value={formData.lastName || ""}
            onChangeText={(text) => handleChange("lastName", text)}
          />
          <LabeledInput
            label="Bio"
            icon="file-text"
            placeholder="Bio"
            value={formData.bio || ""}
            onChangeText={(text) => handleChange("bio", text)}
            multiline
          />
          <LabeledInput
            label="Location"
            icon="map-pin"
            placeholder="Location"
            value={formData.location || ""}
            onChangeText={(text) => handleChange("location", text)}
          />

          <Button
            title="Save"
            onPress={handleSave}
            style={{
              backgroundColor: colors.buttonBackground,
              borderColor: colors.border,
              marginTop: 20,
            }}
            textStyle={{ color: colors.buttonText }}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.actionButtonsContainer}>
          <Button
            title="Log Out"
            onPress={handleSignOut}
            style={{
              width: "auto",
              backgroundColor: colors.buttonBackground,
              borderColor: colors.border,
            }}
            textStyle={{ color: colors.buttonText }}
            icon={{ name: "log-out", position: "right" }}
            iconStyle={{ color: colors.buttonText }}
          />
          <Button
            title="Delete Account"
            onPress={() => deleteAccount.mutate()}
            style={{ width: "auto", backgroundColor: colors.dangerBgColor }}
            textStyle={{ color: colors.dangerTextColor }}
            icon={{ name: "remove", type: "fontawesome", position: "right" }}
          />
        </View>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
    gap: 10,
  },
  actionButtonsContainer: {
    flexDirection: "column",
    gap: 20,
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
  form: {
    width: "90%",
    marginVertical: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
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
