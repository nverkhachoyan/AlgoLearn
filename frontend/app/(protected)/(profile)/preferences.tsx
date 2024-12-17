import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import Button from "@/src/components/common/Button";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import LabeledInput from "@/src/components/common/LabeledInput";
import {
  StickyHeaderSimple,
  HeaderGoBack,
} from "@/src/components/common/StickyHeader";
import useToast from "@/src/hooks/useToast";
import { ImageFile } from "@/src/types/common";
import * as ImagePicker from "expo-image-picker";
import { FontAwesome } from "@expo/vector-icons";
import { useUser } from "@/src/features/user/hooks/useUser";
import { EmptyFooter } from "@/src/components/common/Footer";

const MaxProfilePictureSize = 5 * 1024 * 1024;

interface UpdateUserData {
  username?: string;
  email?: string;
  first_name?: string | undefined;
  last_name?: string | undefined;
  profile_picture_url?: string;
  bio?: string;
  location?: string;
  preferences?: JSON;
}

export default function Preferences() {
  const { isAuthenticated, user, updateUser, signOut } = useUser();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<ImageFile>(null);

  const [formData, setFormData] = useState<UpdateUserData>({
    username: user?.username,
    email: user?.email,
    first_name: user?.firstName,
    last_name: user?.lastName,
    profile_picture_url: user?.profilePictureUrl,
    bio: user?.bio,
    location: user?.location,
  });

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const { uri, type, fileSize } = result.assets[0];
      const fileType = type || "image/jpeg"; // default to image/jpeg if type is not available
      const fileName = uri.split("/").pop();

      if (fileSize && fileSize > MaxProfilePictureSize) {
        showToast("This image is too large. The accepted size is 5MB or less.");
        return;
      }

      setImage(uri);
      setImageFile({ uri, name: fileName, type: fileType });
    }
  };

  const handleDeleteAccount = async () => {
    // deleteAccount.mutate(undefined, {
    //   onSuccess: () => {
    //     showToast("Account successfully deleted");
    //     router.replace("/welcome");
    //   },
    // });
  };

  const handleSignOut = () => {
    signOut.mutate();
    router.replace("/");
  };

  if (!isAuthenticated || !user) {
    return <Text>Not logged in</Text>;
  }

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateUser = async () => {
    const userData = {
      ...formData,
      ...(imageFile && { avatar: imageFile }),
    };

    updateUser.mutate(userData, {
      onSuccess: () => {
        showToast("Account updated successfully");
      },
      onError: () => {
        showToast(`Error while updating user: ${updateUser.error?.message}`);
      },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderGoBack title="Account Preferences" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={pickImage}
            style={styles.profilePictureContainer}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.image} />
            ) : (
              <View style={styles.image}>
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
              </View>
            )}
            <View style={styles.uploadAvatarContainer}>
              <FontAwesome name="edit" style={styles.uploadAvatarText} />
            </View>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {user.username || user.email}
          </Text>
          <Text style={[styles.bio, { color: colors.onSurface }]}>
            {user.bio || "No bio available"}
          </Text>
        </View>

        <View style={styles.form}>
          <LabeledInput
            label="Bio"
            icon="file-text"
            placeholder="Bio"
            value={formData.bio || ""}
            onChangeText={(text) => handleChange("bio", text)}
            multiline={true}
            numberOfLines={4}
            maxLength={140}
            scrollEnabled={true}
          />
          <LabeledInput
            label="Location"
            icon="map-pin"
            placeholder="Location"
            value={formData.location || ""}
            onChangeText={(text) => handleChange("location", text)}
          />
          <LabeledInput
            label="First Name"
            icon="user"
            placeholder="First Name"
            value={formData.first_name || ""}
            onChangeText={(text) => handleChange("first_name", text)}
          />
          <LabeledInput
            label="Last Name"
            icon="user"
            placeholder="Last Name"
            value={formData.last_name || ""}
            onChangeText={(text) => handleChange("last_name", text)}
          />
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

          <Button
            title="Save"
            onPress={() => {
              handleUpdateUser();
            }}
            style={{
              backgroundColor: colors.background,
              borderColor: colors.shadow,
              marginTop: 20,
            }}
            textStyle={{ color: colors.onSurface }}
          />
        </View>

        <View style={styles.separator} />

        <View style={styles.actionButtonsContainer}>
          <Button
            title="Log Out"
            onPress={handleSignOut}
            style={{
              width: "auto",
              backgroundColor: colors.background,
              borderColor: colors.shadow,
            }}
            textStyle={{ color: colors.onSurface }}
            icon={{ name: "log-out", position: "right" }}
            iconStyle={{ color: colors.onSurface }}
          />
          <Button
            title="Delete Account"
            onPress={() => handleDeleteAccount()}
            style={{ width: "auto", backgroundColor: "red" }}
            textStyle={{ color: colors.onSurface }}
            icon={{ name: "remove", type: "fontawesome", position: "right" }}
          />
        </View>
        <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
      </ScrollView>
      <EmptyFooter />
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
  profilePictureContainer: {
    position: "relative",
    width: 100,
    height: 100,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 100,
  },
  image: {
    width: 100,
    height: 100,
    position: "relative",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 100,
  },
  uploadAvatarContainer: {
    width: "100%",
    fontSize: 16,
    // fontFamily: "OpenSauceOne-Regular",
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 5,
    borderBottomStartRadius: 100,
    borderBottomEndRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadAvatarText: {
    color: "white",
    fontSize: 16,
    // fontFamily: "OpenSauceOne-Regular",
    textAlign: "center",
  },
});
