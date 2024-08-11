import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Button from "@/components/common/Button";
import { Feather } from "@expo/vector-icons";
import { useAuthContext } from "@/context/AuthProvider";
import useTheme from "@/hooks/useTheme";
import { useUser } from "@/hooks/useUser";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import useToast from "@/hooks/useToast";

import { ImageFile } from "@/types/CommonTypes";

const MaxProfilePictureSize = 5 * 1024 * 1024;

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const { isAuthed } = useAuthContext();
  const { colors } = useTheme();
  const { updateUser } = useUser();
  const { showToast } = useToast();

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

  if (!isAuthed) {
    router.navigate("/signup");
  }

  const handleUpdateUser = async () => {
    if (!username || !firstName || !lastName) {
      showToast("Please fill in all fields");
      return;
    }

    try {
      const userData = {
        username,
        first_name: firstName,
        last_name: lastName,
      };

      if (imageFile) {
        updateUser.mutate({
          ...userData,
          avatar: imageFile,
        });
      } else {
        updateUser.mutate(userData);
      }
      router.navigate("/pushnotifications");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  useEffect(() => {
    if (updateUser.error) {
      console.log("Error while updating user", updateUser.error.message);
    }
  }, [updateUser.error]);

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
                color={colors.text}
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
          onChangeText={(newFirstName) => setFirstName(newFirstName)}
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
          onChangeText={(newLastName) => setLastName(newLastName)}
          autoCapitalize="none"
        />
        <Button
          title="Save Details"
          onPress={handleUpdateUser}
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
    marginTop: 10,
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
    fontFamily: "OpenSauceOne-Regular",
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
    fontFamily: "OpenSauceOne-Regular",
    textAlign: "center",
  },
});
