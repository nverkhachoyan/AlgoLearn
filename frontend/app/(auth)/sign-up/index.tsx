import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Button from "@/src/components/common/Button";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "react-native-paper";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useToast from "@/src/hooks/useToast";

import { ImageFile } from "@/src/types/common";
import { useUser } from "@/src/features/user/hooks/useUser";
import { Colors } from "@/constants/Colors";

const MaxProfilePictureSize = 5 * 1024 * 1024;

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const { updateUser } = useUser();
  const { colors }: { colors: Colors } = useTheme();
  const { showToast } = useToast();

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

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

  const handleUpdateUser = async () => {
    if (!username || !firstName || !lastName) {
      showToast("Please fill in all fields");
      return;
    }

    const userData = {
      username,
      first_name: firstName,
      last_name: lastName,
      ...(imageFile && { avatar: imageFile }),
    };

    updateUser.mutate(userData, {
      onSuccess: () => {
        router.navigate("/(auth)/sign-up/courses");
      },
      onError: () => {
        showToast(`Error while updating user: ${updateUser.error?.message}`);
      },
    });
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
      <View style={styles.middleContent}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.profilePictureContainer}
        >
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <View style={styles.image}>
              <FontAwesome
                name="user-circle"
                color={colors.onSurface}
                size={200}
                style={{ width: "100%" }}
              />
            </View>
          )}
          <View style={styles.uploadAvatarContainer}>
            <Text style={styles.uploadAvatarText}>Upload Avatar</Text>
          </View>
        </TouchableOpacity>
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.shadow,
              color: colors.onSurface,
            },
          ]}
          value={username}
          placeholder="Username"
          placeholderTextColor={colors.secondary}
          onChangeText={(newUsername) => setUsername(newUsername)}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.shadow,
              color: colors.onSurface,
            },
          ]}
          value={firstName}
          placeholder="First name"
          placeholderTextColor={colors.secondary}
          onChangeText={(newFirstName) => setFirstName(newFirstName)}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.textInput,
            {
              borderColor: colors.shadow,
              color: colors.onSurface,
            },
          ]}
          value={lastName}
          placeholder="Last name"
          placeholderTextColor={colors.secondary}
          onChangeText={(newLastName) => setLastName(newLastName)}
          autoCapitalize="none"
        />
        <Button
          title="Save Details"
          onPress={handleUpdateUser}
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
    marginTop: 10,
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
  profilePictureContainer: {
    position: "relative",
    width: 200,
    height: 200,
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderRadius: 100,
  },
  image: {
    width: 200,
    height: 200,
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
    position: "absolute",
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    padding: 15,
    paddingBottom: 20,
    borderBottomStartRadius: 100,
    borderBottomEndRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadAvatarText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
});
