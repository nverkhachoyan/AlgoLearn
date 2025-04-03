import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Button from '@/src/components/Button';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/src/context/ThemeContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import useToast from '@/src/hooks/useToast';
import LabeledInput from '@/src/components/LabeledInput';

import { ImageFile } from '@/src/types/common';
import { useUser } from '@/src/features/user/hooks/useUser';
import { Colors } from '@/constants/Colors';

import Conditional from '@/src/components/Conditional';
import { User } from '@/src/features/user/types/index';

import { randomUUID } from 'expo-crypto';

const MaxProfilePictureSize = 5 * 1024 * 1024;

export default function UserDetails() {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const { updateUser } = useUser();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const { showToast } = useToast();

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        const { uri, fileSize, type } = result.assets[0];
        const fileExt = uri.split('.').pop() || 'jpeg';
        const fileName = uri.split('/').pop() || `${randomUUID()}.${fileExt}`;

        if (fileSize && fileSize > MaxProfilePictureSize) {
          showToast('This image is too large. The accepted size is 5MB or less.');
          return;
        }

        if (!uri || !fileSize || !type) {
          showToast('Unable to determine image metadata');
          return;
        }

        setImageFile({
          uri,
          name: fileName,
          ext: fileExt,
          size: fileSize,
          contentType: `${type}/${fileExt}`,
        });
      }
    } else {
      showToast('NOT IMPLEMENTED FOR WEB YET');
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
              condition={imageFile !== null && imageFile.uri !== ''}
              renderTrue={() => <Image source={{ uri: imageFile!.uri }} style={styles.image} />}
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
            <LabeledInput
              label="Username"
              icon="user"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a unique username"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.onSurface }]}>First name</Text>
            <LabeledInput
              label="First name"
              icon="user"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Your first name"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.onSurface }]}>Last name</Text>
            <LabeledInput
              label="Last name"
              icon="user"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Your last name"
            />
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

        <Button
          title="Skip"
          onPress={() => {
            router.navigate('/(auth)/onboarding/courses');
          }}
          icon={{ name: 'arrow-right', position: 'right' }}
          textStyle={{
            color: colors.onSurface,
            fontSize: 16,
            fontWeight: '600',
          }}
          iconStyle={{
            position: 'absolute',
            right: 20,
            color: colors.onSurface,
          }}
          style={{
            backgroundColor: 'transparent',
            borderWidth: 0.5,
            borderColor: colors.surface,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 24,
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
