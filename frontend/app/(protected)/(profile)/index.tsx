import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Animated, TouchableOpacity } from 'react-native';
import { useUser } from '@/src/features/user/hooks/useUser';
import Button from '@/src/components/Button';
import { Feather } from '@expo/vector-icons';
import { ScrollView } from 'react-native';
import { Spinning } from '@/src/components/Spinning';
import Conditional from '@/src/components/Conditional';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import useToast from '@/src/hooks/useToast';
import { ImageFile } from '@/src/types/common';
import { useAuth } from '@/src/features/auth/AuthContext';
import { randomUUID } from 'expo-crypto';
import { User, UserPreferences } from '@/src/features/user/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { USER_PROFILE_GRADIENTS, Colors } from '@/constants/Colors';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

import ProfileHeader from '@/src/features/profile/ProfileHeader';
import BioSection from '@/src/features/profile/BioSection';
import ProfileEditForm from '@/src/features/profile/ProfileEditForm';
import ReadOnlyUserInfo from '@/src/features/profile/ReadOnlyUserInfo';
import ThemeSelector from '@/src/features/profile/ThemeSelector';
import AccountActions from '@/src/features/profile/AccountActions';
import SectionDivider from '@/src/features/profile/SectionDivider';

const MaxProfilePictureSize = 5 * 1024 * 1024;

interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string | undefined;
  lastName?: string | undefined;
  bio?: string;
  location?: string;
  preferences?: UserPreferences;
}

type GradientThemeKey = keyof typeof USER_PROFILE_GRADIENTS;

export default function Profile() {
  const { user, updateUser } = useUser();
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const imageAnim = useRef(new Animated.Value(0)).current;
  const gradientAnim = useRef(new Animated.Value(0)).current;
  const blurAnim = useRef(new Animated.Value(0)).current;
  const [gradientTheme, setGradientTheme] = useState<GradientThemeKey>('default');
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const [scrollY, setScrollY] = useState(0);
  const [showBlur, setShowBlur] = useState(false);
  const { showToast } = useToast();
  const { signOut } = useAuth();
  const router = useRouter();

  if (!user) {
    return <Spinning />;
  }

  const [formData, setFormData] = useState<UpdateUserData>({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        location: user.location,
      });
    }
  }, [user]);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('profileGradientTheme');
        if (savedTheme && Object.keys(USER_PROFILE_GRADIENTS).includes(savedTheme)) {
          setGradientTheme(savedTheme as GradientThemeKey);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    Animated.sequence([
      // Animate the gradient
      Animated.timing(gradientAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      // Animate the profile image
      Animated.timing(imageAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      // Animate the content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, imageAnim, gradientAnim]);

  const saveThemePreference = async (theme: GradientThemeKey) => {
    try {
      await AsyncStorage.setItem('profileGradientTheme', theme);
      setGradientTheme(theme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  const handleChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleUpdateUser = async () => {
    if (!formData) {
      showToast('Please fill in all fields');
      return;
    }

    let userData: Partial<User> = {
      ...formData,
    };

    if (imageFile !== null) {
      userData.imageFile = imageFile;
    }

    await updateUser.mutateAsync(userData, {
      onSuccess: () => {
        showToast('Successfully updated profile');
        setImageFile(null);
      },
      onError: () => {
        showToast(`Failed to update profile. ${updateUser.error?.message}`);
        setImageFile(null);
      },
    });
    setEditMode(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      showToast('Error signing out');
    }
  };

  const handleDeleteAccount = async () => {};

  const currentTheme = USER_PROFILE_GRADIENTS[gradientTheme];
  const gradientColors = dark
    ? (currentTheme.dark as [string, string])
    : (currentTheme.light as [string, string]);

  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    setScrollY(currentScrollY);

    const shouldShowBlur = currentScrollY > 160;
    if (shouldShowBlur !== showBlur) {
      setShowBlur(shouldShowBlur);
      Animated.timing(blurAnim, {
        toValue: shouldShowBlur ? 1 : 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Animated.View
        style={{
          opacity: gradientAnim,
          transform: [
            {
              translateY: gradientAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundGradient}
        />
      </Animated.View>

      <View style={styles.navigationArea}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 105,
            opacity: blurAnim,
            zIndex: 1,
          }}
          pointerEvents="none"
        >
          <BlurView
            intensity={60}
            tint={dark ? 'dark' : 'default'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        </Animated.View>

        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
          style={styles.goBackButton}
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.actionButton}>
          <Feather name={editMode ? 'eye' : 'edit'} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={[styles.mainContainer, { backgroundColor: 'transparent' }]}>
        <View style={styles.fixedProfileHeader}>
          <ProfileHeader
            user={user}
            imageFile={imageFile}
            editMode={editMode}
            onImagePress={pickImage}
            colors={colors}
            isDark={dark}
            imageAnim={imageAnim}
          />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Spacer to push the content down below the fixed header */}
          <View style={styles.headerSpacer} />

          <Animated.View
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <BioSection
              bio={formData.bio || ''}
              editMode={editMode}
              onBioChange={value => handleChange('bio', value)}
              isDark={dark}
            />

            <View style={[styles.userInfoContainer, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Account Information
              </Text>

              <Conditional
                condition={editMode}
                renderTrue={() => (
                  <ProfileEditForm
                    formData={formData}
                    onFormChange={handleChange}
                    section="account"
                  />
                )}
                renderFalse={() => <ReadOnlyUserInfo user={user} section="account" />}
              />

              <SectionDivider title="Personal Information" isDark={dark} withMarginTop />

              <Conditional
                condition={editMode}
                renderTrue={() => (
                  <ProfileEditForm
                    formData={formData}
                    onFormChange={handleChange}
                    section="personal"
                  />
                )}
                renderFalse={() => <ReadOnlyUserInfo user={user} section="personal" />}
              />

              <Conditional
                condition={editMode}
                renderTrue={() => (
                  <>
                    <SectionDivider title="Theme Preference" isDark={dark} withMarginTop />
                    <ThemeSelector
                      currentTheme={gradientTheme}
                      onThemeChange={saveThemePreference}
                      isDark={dark}
                    />
                  </>
                )}
                renderFalse={null}
              />

              <Conditional
                condition={!editMode}
                renderTrue={() => (
                  <>
                    <SectionDivider title="Date Information" isDark={dark} withMarginTop />
                    <ReadOnlyUserInfo user={user} section="dates" />

                    <SectionDivider title="Status" isDark={dark} withMarginTop />
                    <ReadOnlyUserInfo user={user} section="status" />
                  </>
                )}
                renderFalse={null}
              />
            </View>

            <Conditional
              condition={editMode}
              renderTrue={() => (
                <>
                  <Button
                    title="Save Changes"
                    onPress={handleUpdateUser}
                    style={{
                      ...styles.settingsButton,
                      backgroundColor: colors.primary,
                    }}
                    textStyle={{ color: colors.surface, fontWeight: 'bold' }}
                    icon={{ name: 'check', position: 'right' }}
                    iconStyle={{ color: '#FFFFFF' }}
                  />

                  <AccountActions
                    onSignOut={handleSignOut}
                    onDeleteAccount={handleDeleteAccount}
                    isDark={dark}
                  />
                </>
              )}
              renderFalse={null}
            />
          </Animated.View>
        </ScrollView>
      </View>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    zIndex: 0,
  },
  fixedProfileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerSpacer: {
    height: 220, // Enough to push content below the fixed header
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  contentContainer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  goBackButton: {
    position: 'absolute',
    left: 16,
    top: Platform.OS === 'ios' ? 60 : 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  actionButton: {
    position: 'absolute',
    right: 16,
    top: Platform.OS === 'ios' ? 60 : 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 11,
  },
  userInfoContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingsButton: {
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 20,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  navigationArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
