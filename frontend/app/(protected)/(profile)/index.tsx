import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Image, View, Animated, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useUser } from '@/src/features/user/hooks/useUser';
import Button from '@/src/components/common/Button';
import { Feather } from '@expo/vector-icons';
import { HeaderGoBack } from '@/src/components/common/StickyHeader';
import { ScrollView } from 'react-native';
import { humanReadableDate } from '@/src/lib/utils/date';
import { Spinning } from '@/src/components/common/Spinning';
import { buildImgUrl } from '@/src/lib/utils/transform';
import Conditional from '@/src/components/Conditional';
import { NIL_UUID } from '@/src/features/upload/utils';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LabeledInput from '@/src/components/common/LabeledInput';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import useToast from '@/src/hooks/useToast';
import { ImageFile } from '@/src/types/common';
import { useAuth } from '@/src/features/auth/AuthContext';
import { randomUUID } from 'expo-crypto';
import { User, UserPreferences } from '@/src/features/user/types';

type IconType = React.ComponentProps<typeof Feather>['name'];

const GRADIENT_THEMES = {
  default: {
    name: 'Default',
    light: ['#4F6CF7', '#6A78ED', '#8A84E2'],
    dark: ['#4F6CF7', '#3D4FA3', '#2A3550'],
  },
  purple: {
    name: 'Purple',
    light: ['#8A2BE2', '#AE67DD', '#D8BFD8'],
    dark: ['#8A2BE2', '#612094', '#38204C'],
  },
  green: {
    name: 'Green',
    light: ['#2E8B57', '#63AE7B', '#98FB98'],
    dark: ['#2E8B57', '#246843', '#1A3C2A'],
  },
  sunset: {
    name: 'Sunset',
    light: ['#FF7F50', '#FF9765', '#FFA07A'],
    dark: ['#FF7F50', '#CF573D', '#5E2F25'],
  },
  ocean: {
    name: 'Ocean',
    light: ['#00CED1', '#43DFDF', '#87CEEB'],
    dark: ['#00CED1', '#059B9F', '#0A4958'],
  },
  amber: {
    name: 'Amber',
    light: ['#E6B800', '#F0CA40', '#F9E080'],
    dark: ['#E6B800', '#A38308', '#4D4000'],
  },
};

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

type GradientThemeKey = keyof typeof GRADIENT_THEMES;

export default function Profile() {
  const { user, updateUser } = useUser();
  const { colors, dark } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [gradientTheme, setGradientTheme] = useState<GradientThemeKey>('default');
  const [editMode, setEditMode] = useState(false);
  const [imageFile, setImageFile] = useState<ImageFile>(null);
  const { showToast } = useToast();
  const { signOut } = useAuth();

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
        if (savedTheme && Object.keys(GRADIENT_THEMES).includes(savedTheme)) {
          setGradientTheme(savedTheme as GradientThemeKey);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      }
    };

    loadThemePreference();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

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

  const currentTheme = GRADIENT_THEMES[gradientTheme];
  const gradientColors = dark
    ? (currentTheme.dark as [string, string])
    : (currentTheme.light as [string, string]);

  const profileImageContainerStyle = [
    styles.profileImageContainer,
    {
      backgroundColor: dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)',
    },
  ];

  const renderProfileImage = () => {
    const profileImageView = (
      <Conditional
        condition={(user.imgKey != NIL_UUID && user.imgKey != '') || imageFile?.uri != ''}
        renderTrue={() => (
          <Image
            source={{
              uri: imageFile?.uri
                ? imageFile?.uri
                : buildImgUrl('users', user.folderObjectKey, user.imgKey, user.mediaExt),
            }}
            style={[styles.profilePicture, { borderColor: dark ? colors.surface : '#FFFFFF' }]}
          />
        )}
        renderFalse={() => (
          <Image
            source={require('@/assets/images/defaultAvatar.png')}
            style={[styles.profilePicture, { borderColor: dark ? colors.surface : '#FFFFFF' }]}
          />
        )}
      />
    );

    // In edit mode we wrap in a touchable with camera indicator
    if (editMode) {
      return (
        <TouchableOpacity onPress={pickImage} style={profileImageContainerStyle}>
          {profileImageView}
          <View style={styles.uploadAvatarContainer}>
            <FontAwesome name="camera" size={16} style={styles.uploadAvatarText} />
          </View>
        </TouchableOpacity>
      );
    }

    // In view mode, just show the image
    return <View style={profileImageContainerStyle}>{profileImageView}</View>;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderGoBack title={editMode ? 'Edit Profile' : 'Profile'} />
      <ScrollView contentContainerStyle={[styles.scrollView, { flexGrow: 1 }]}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.profileHeader}>
              <TouchableOpacity onPress={() => setEditMode(!editMode)} style={styles.actionButton}>
                <Feather name={editMode ? 'eye' : 'edit'} size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Profile Picture */}
              {renderProfileImage()}

              {/* User name display */}
              <Conditional
                condition={!editMode && !!(user.firstName || user.lastName)}
                renderTrue={() => (
                  <Text style={[styles.fullName, { color: '#FFFFFF' }]}>
                    {user.firstName + ' ' + user.lastName}
                  </Text>
                )}
                renderFalse={null}
              />

              <Conditional
                condition={!editMode}
                renderTrue={() => (
                  <Text style={[styles.username, { color: '#FFFFFF' }]}>
                    {'@' + user.username || user.email}
                  </Text>
                )}
                renderFalse={null}
              />
            </View>
          </LinearGradient>

          {/* Bio Card - Always visible in both modes */}
          <View
            style={[styles.bioContainer, { backgroundColor: dark ? colors.surface : '#FFFFFF' }]}
          >
            <Text style={[styles.bioTitle, { color: colors.primary }]}>About</Text>

            <Conditional
              condition={editMode}
              renderTrue={() => (
                <View style={styles.bioInputContainer}>
                  <LabeledInput
                    label="Bio"
                    icon="file-text"
                    placeholder="Write a short bio about yourself"
                    value={formData.bio || ''}
                    onChangeText={text => handleChange('bio', text)}
                    multiline={true}
                    numberOfLines={4}
                    maxLength={140}
                    scrollEnabled={true}
                  />
                </View>
              )}
              renderFalse={() => (
                <Text style={[styles.bio, { color: colors.onSurface }]}>
                  {user.bio || 'No bio available'}
                </Text>
              )}
            />
          </View>

          {/* User Info Container - Adaptive based on mode */}
          <View style={[styles.userInfoContainer, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>
              Account Information
            </Text>

            <Conditional
              condition={editMode}
              renderTrue={() => (
                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <LabeledInput
                      label="Username"
                      icon="at-sign"
                      placeholder="Username"
                      value={formData.username || ''}
                      onChangeText={text => handleChange('username', text)}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <LabeledInput
                      label="Email"
                      icon="mail"
                      placeholder="Email"
                      value={formData.email || ''}
                      onChangeText={text => handleChange('email', text)}
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              )}
              renderFalse={() => (
                <>
                  <UserInfoRow icon="mail" label="Email" value={user.email} />
                  <UserInfoRow icon="user" label="Username" value={user.username || 'N/A'} />
                  <UserInfoRow icon="cpu" label="CPUS" value={`${user.cpus}`} />
                  <UserInfoRow
                    icon="tag"
                    label="Role"
                    value={`${user.role}`.charAt(0).toUpperCase() + `${user.role}`.slice(1)}
                  />
                </>
              )}
            />

            <View
              style={[
                styles.infoSeparator,
                { backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' },
              ]}
            />

            <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 15 }]}>
              Personal Information
            </Text>

            <Conditional
              condition={editMode}
              renderTrue={() => (
                <View style={styles.formSection}>
                  <View style={styles.inputContainer}>
                    <LabeledInput
                      label="First Name"
                      icon="user"
                      placeholder="First Name"
                      value={formData.firstName || ''}
                      onChangeText={text => handleChange('firstName', text)}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <LabeledInput
                      label="Last Name"
                      icon="user"
                      placeholder="Last Name"
                      value={formData.lastName || ''}
                      onChangeText={text => handleChange('lastName', text)}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <LabeledInput
                      label="Location"
                      icon="map-pin"
                      placeholder="Your city or country"
                      value={formData.location || ''}
                      onChangeText={text => handleChange('location', text)}
                    />
                  </View>
                </View>
              )}
              renderFalse={() => (
                <>
                  <Conditional
                    condition={!!(user.firstName || user.lastName)}
                    renderTrue={() => (
                      <UserInfoRow
                        icon="user"
                        label="Name"
                        value={`${user.firstName || ''} ${user.lastName || ''}`}
                      />
                    )}
                    renderFalse={null}
                  />

                  <Conditional
                    condition={!!user.location}
                    renderTrue={() => (
                      <UserInfoRow icon="map-pin" label="Location" value={user.location || ''} />
                    )}
                    renderFalse={null}
                  />
                </>
              )}
            />

            {/* Theme selection (only in edit mode) */}
            <Conditional
              condition={editMode}
              renderTrue={() => (
                <>
                  <View
                    style={[
                      styles.infoSeparator,
                      {
                        backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 15 }]}>
                    Theme Preference
                  </Text>
                  <View style={styles.themeOptions}>
                    {Object.entries(GRADIENT_THEMES).map(([key, theme]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.themeOption,
                          gradientTheme === key && styles.selectedThemeOption,
                        ]}
                        onPress={() => saveThemePreference(key as GradientThemeKey)}
                      >
                        <LinearGradient
                          colors={
                            dark
                              ? (theme.dark as [string, string])
                              : (theme.light as [string, string])
                          }
                          style={styles.themePreview}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                        />
                        <Text style={[styles.themeOptionText, { color: colors.onSurface }]}>
                          {theme.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
              renderFalse={null}
            />

            <Conditional
              condition={!editMode}
              renderTrue={() => (
                <>
                  <View
                    style={[
                      styles.infoSeparator,
                      {
                        backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 15 }]}>
                    Date Information
                  </Text>
                  <UserInfoRow
                    icon="calendar"
                    label="Created"
                    value={humanReadableDate(user.createdAt)}
                  />
                  <UserInfoRow
                    icon="clock"
                    label="Last Login"
                    value={humanReadableDate(user.lastLoginAt)}
                  />
                  <View
                    style={[
                      styles.infoSeparator,
                      {
                        backgroundColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
                      },
                    ]}
                  />
                  <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 15 }]}>
                    Status
                  </Text>
                  <UserInfoRow
                    icon="check-circle"
                    label="Active"
                    value={user.isActive ? 'Yes' : 'No'}
                    highlight={user.isActive}
                  />
                  <UserInfoRow
                    icon="check-circle"
                    label="Email Verified"
                    value={user.isEmailVerified ? 'Yes' : 'No'}
                    highlight={user.isEmailVerified}
                  />
                </>
              )}
              renderFalse={null}
            />
          </View>

          {/* Action Buttons only in edit mode */}
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

                <View
                  style={[styles.actionsCard, { backgroundColor: dark ? colors.surface : 'white' }]}
                >
                  <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                    Account Actions
                  </Text>

                  <View style={styles.actionsContainer}>
                    <Button
                      title="Sign Out"
                      onPress={handleSignOut}
                      style={styles.signOutButton}
                      textStyle={{ color: colors.onSurface, fontWeight: '500' }}
                      icon={{ name: 'log-out', position: 'left' }}
                      iconStyle={{ color: colors.onSurface }}
                    />

                    <Button
                      title="Delete Account"
                      onPress={handleDeleteAccount}
                      style={styles.deleteButton}
                      textStyle={{ color: 'white', fontWeight: '500' }}
                      icon={{ name: 'trash-2', position: 'left' }}
                      iconStyle={{ color: 'white' }}
                    />
                  </View>
                </View>
              </>
            )}
            renderFalse={null}
          />
        </Animated.View>
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      </ScrollView>
    </View>
  );
}

function UserInfoRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: IconType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { colors, dark } = useTheme();
  return (
    <View style={styles.userInfoRow}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: highlight
              ? colors.primary + '20'
              : dark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={highlight ? colors.primary : colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.userInfoLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
        <Text style={[styles.userInfoText, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    position: 'absolute',
    right: 20,
    top: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  profileImageContainer: {
    padding: 4,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  profilePicture: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  uploadAvatarContainer: {
    position: 'absolute',
    bottom: 5,
    width: 102,
    alignSelf: 'center',
    borderBottomLeftRadius: 99,
    borderBottomRightRadius: 99,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 15,
    alignItems: 'center',
  },
  uploadAvatarText: {
    color: 'white',
    fontSize: 16,
  },
  fullName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    marginTop: 4,
    opacity: 0.9,
  },
  themeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  themeOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedThemeOption: {
    transform: [{ scale: 1.07 }],
  },
  themePreview: {
    width: 55,
    height: 55,
    borderRadius: 10,
    marginBottom: 5,
  },
  themeOptionText: {
    fontSize: 12,
  },
  bioContainer: {
    marginTop: -25,
    marginHorizontal: 20,
    padding: 20,
    paddingBottom: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bio: {
    fontSize: 15,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
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
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  userInfoLabel: {
    fontSize: 13,
  },
  userInfoText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  infoSeparator: {
    height: 1,
    width: '100%',
    marginVertical: 5,
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
  formContainer: {
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 20,
  },
  formSection: {
    marginBottom: 15,
  },
  inputContainer: {},
  bioInputContainer: {},
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: 20,
  },
  actionsCard: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionsContainer: {
    gap: 15,
  },
  signOutButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 0,
  },
  deleteButton: {
    height: 50,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    borderWidth: 0,
  },
});
