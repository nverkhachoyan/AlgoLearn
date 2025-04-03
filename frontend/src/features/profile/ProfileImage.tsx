import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { buildImgUrl } from '@/src/lib/utils/transform';
import Conditional from '@/src/components/Conditional';
import { NIL_UUID } from '@/src/features/upload/utils';
import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { User } from '../user/types';
import { ImageFile } from '@/src/types';
import { Colors } from '@/constants/Colors';

const ProfileImage = ({
  user,
  imageFile,
  editMode,
  onPress,
  colors,
  isDark,
}: {
  user: User;
  imageFile: ImageFile;
  editMode: boolean;
  colors: Colors;
  isDark: boolean;
  onPress: () => void;
}) => {
  const profileImageContainerStyle = [
    styles.profileImageContainer,
    {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)',
    },
  ];

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
          style={[styles.profilePicture, { borderColor: isDark ? colors.surface : '#FFFFFF' }]}
        />
      )}
      renderFalse={() => (
        <Image
          source={require('@/assets/images/defaultAvatar.png')}
          style={[styles.profilePicture, { borderColor: isDark ? colors.surface : '#FFFFFF' }]}
        />
      )}
    />
  );

  if (editMode) {
    return (
      <TouchableOpacity onPress={onPress} style={profileImageContainerStyle}>
        {profileImageView}
        <View style={styles.uploadAvatarContainer}>
          <FontAwesome name="camera" size={16} style={styles.uploadAvatarText} />
        </View>
      </TouchableOpacity>
    );
  }

  return <View style={profileImageContainerStyle}>{profileImageView}</View>;
};

export default ProfileImage;

const styles = StyleSheet.create({
  profileImageContainer: {
    padding: 4,
    marginVertical: 20,
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
});
