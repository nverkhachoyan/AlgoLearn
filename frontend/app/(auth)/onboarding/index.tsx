import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  Animated,
} from 'react-native';

import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/src/components/common/Button';
import { Feather } from '@expo/vector-icons';
import { useTheme, TextInput } from 'react-native-paper';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useToast from '@/src/hooks/useToast';

import { ImageFile } from '@/src/types/common';
import { useUser } from '@/src/features/user/hooks/useUser';
import { Colors } from '@/constants/Colors';

import Conditional from '@/src/components/Conditional';
import { User } from '@/src/features/user/types/index';

import { v4 as uuidv4 } from 'uuid';

const MaxProfilePictureSize = 5 * 1024 * 1024;

export default function UserDetails() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const { updateUser } = useUser();
  const { colors }: { colors: Colors } = useTheme();
  const { showToast } = useToast();
  const [isFocused, setIsFocused] = useState({
    username: false,
    firstName: false,
    lastName: false,
  });

  const usernameScale = useRef(new Animated.Value(1)).current;
  const firstNameScale = useRef(new Animated.Value(1)).current;
  const lastNameScale = useRef(new Animated.Value(1)).current;

  const animateScale = (animatedValue: Animated.Value, toValue: number) => {
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  };

  useEffect(() => {
    animateScale(usernameScale, isFocused.username ? 1.02 : 1);
  }, [isFocused.username]);

  useEffect(() => {
    animateScale(firstNameScale, isFocused.firstName ? 1.02 : 1);
  }, [isFocused.firstName]);

  useEffect(() => {
    animateScale(lastNameScale, isFocused.lastName ? 1.02 : 1);
  }, [isFocused.lastName]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri, fileSize, file, type } = result.assets[0];
      const fileExt = uri.split('.').pop() || 'jpeg';
      const fileName = uri.split('/').pop() || uuidv4();

      if (fileSize && fileSize > MaxProfilePictureSize) {
        showToast('This image is too large. The accepted size is 5MB or less.');
        return;
      }

      if (file) {
        console.log('it is there');
        setImage(uri);
        setImageFile({
          uri,
          name: fileName,
          ext: fileExt,
          file,
          contentType: `${type}/${fileExt}`,
        });
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!username || !firstName || !lastName) {
      showToast('Please fill in all fields');
      return;
    }

    const userData: Partial<User> = {
      username,
      firstName,
      lastName,
    };

    if (imageFile) {
      userData.imageFile = imageFile;
    }

    await updateUser.mutateAsync(userData, {
      onSuccess: () => {
        router.navigate('/(auth)/onboarding/courses');
      },
      onError: () => {
        showToast(`Error while updating user: ${updateUser.error?.message}`);
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.goBackButton}
        onPress={() => router.back()}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Feather name="arrow-left" size={24} color={colors.onSurface} />
      </Pressable>

      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Complete Your Profile</Text>
        <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          Let us know who you are
        </Text>
      </View>

      <View style={styles.middleContent}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={pickImage}
            style={[styles.profilePictureContainer, { borderColor: colors.surfaceVariant }]}
            activeOpacity={0.8}
          >
            <Conditional
              condition={image !== null}
              renderTrue={() => <Image source={{ uri: image! }} style={styles.image} />}
              renderFalse={() => (
                <View style={[styles.emptyAvatar, { backgroundColor: colors.surfaceVariant }]}>
                  <FontAwesome name="user" color={colors.onSurfaceVariant} size={60} />
                  <Text style={[styles.addPhotoText, { color: colors.onSurfaceVariant }]}>
                    Add Photo
                  </Text>
                </View>
              )}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.editButton,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.shadow,
              },
            ]}
            onPress={pickImage}
          >
            <Feather name="camera" size={16} color={colors.onPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputsContainer}>
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Username</Text>
            <Animated.View style={{ transform: [{ scaleX: usernameScale }] }}>
              <TextInput
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                placeholder="Choose a unique username"
                autoCapitalize="none"
                style={[styles.textInput, { backgroundColor: colors.surface }]}
                onFocus={() => setIsFocused(prev => ({ ...prev, username: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, username: false }))}
                placeholderTextColor={colors.surfaceDisabled}
                outlineColor={colors.shadow}
                activeOutlineColor={colors.secondary}
                outlineStyle={{ borderRadius: 8, borderWidth: 0.5, borderColor: colors.shadow }}
              />
            </Animated.View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.onSurface }]}>First name</Text>
            <Animated.View style={{ transform: [{ scaleX: firstNameScale }] }}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                mode="outlined"
                placeholder="Your first name"
                autoCapitalize="words"
                style={[styles.textInput, { backgroundColor: colors.surface }]}
                onFocus={() => setIsFocused(prev => ({ ...prev, firstName: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, firstName: false }))}
                placeholderTextColor={colors.surfaceDisabled}
                outlineStyle={{ borderRadius: 8, borderWidth: 0.5, borderColor: colors.shadow }}
              />
            </Animated.View>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Last name</Text>
            <Animated.View style={{ transform: [{ scaleX: lastNameScale }] }}>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                mode="outlined"
                placeholder="Your last name"
                autoCapitalize="words"
                style={[styles.textInput, { backgroundColor: colors.surface }]}
                onFocus={() => setIsFocused(prev => ({ ...prev, lastName: true }))}
                onBlur={() => setIsFocused(prev => ({ ...prev, lastName: false }))}
                placeholderTextColor={colors.surfaceDisabled}
                outlineStyle={{ borderRadius: 8, borderWidth: 0.5, borderColor: colors.shadow }}
              />
            </Animated.View>
          </View>
        </View>

        <Button
          title="Continue"
          onPress={handleUpdateUser}
          icon={{ name: 'arrow-right', position: 'right' }}
          textStyle={{
            color: colors.onPrimary,
            fontSize: 16,
            fontWeight: '600',
          }}
          iconStyle={{
            position: 'absolute',
            right: 20,
            color: colors.onPrimary,
          }}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 24,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  middleContent: {
    width: '100%',
  },
  avatarContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 32,
  },
  profilePictureContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 75,
    borderWidth: 2,
  },
  emptyAvatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  inputsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    height: 35,
    padding: 5,
    fontSize: 16,
  },
});
