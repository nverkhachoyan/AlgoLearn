import { StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import React from 'react';
import Conditional from '@/src/components/Conditional';
import ProfileImage from './ProfileImage';
import { User } from '@/src/features/user/types';
import { ImageFile } from '@/src/types';
import { Colors } from '@/constants/Colors';

interface ProfileHeaderProps {
  user: User;
  imageFile: ImageFile;
  editMode: boolean;
  onImagePress: () => void;
  colors: Colors;
  isDark: boolean;
  imageAnim: Animated.Value;
}

const ProfileHeader = ({
  user,
  imageFile,
  editMode,
  onImagePress,
  colors,
  isDark,
  imageAnim,
}: ProfileHeaderProps) => {
  return (
    <Animated.View
      style={[
        styles.profileHeader,
        {
          opacity: imageAnim,
          transform: [
            {
              translateY: imageAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <ProfileImage
        user={user}
        imageFile={imageFile}
        editMode={editMode}
        onPress={onImagePress}
        colors={colors}
        isDark={isDark}
      />

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
    </Animated.View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
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
});
