import { View, StyleSheet } from 'react-native';
import React from 'react';
import LabeledInput from '@/src/components/LabeledInput';

interface ProfileFormData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
}

interface ProfileEditFormProps {
  formData: ProfileFormData;
  onFormChange: (name: string, value: string) => void;
  section: 'account' | 'personal';
}

const ProfileEditForm = ({ formData, onFormChange, section }: ProfileEditFormProps) => {
  return (
    <View style={styles.formSection}>
      {section === 'account' && (
        <>
          <LabeledInput
            label="Username"
            icon="at-sign"
            placeholder="Username"
            value={formData.username || ''}
            onChangeText={text => onFormChange('username', text)}
          />

          <LabeledInput
            label="Email"
            icon="mail"
            placeholder="Email"
            value={formData.email || ''}
            onChangeText={text => onFormChange('email', text)}
            keyboardType="email-address"
          />
        </>
      )}

      {section === 'personal' && (
        <>
          <LabeledInput
            label="First Name"
            icon="user"
            placeholder="First Name"
            value={formData.firstName || ''}
            onChangeText={text => onFormChange('firstName', text)}
          />

          <LabeledInput
            label="Last Name"
            icon="user"
            placeholder="Last Name"
            value={formData.lastName || ''}
            onChangeText={text => onFormChange('lastName', text)}
          />

          <LabeledInput
            label="Location"
            icon="map-pin"
            placeholder="Your city or country"
            value={formData.location || ''}
            onChangeText={text => onFormChange('location', text)}
          />
        </>
      )}
    </View>
  );
};

export default ProfileEditForm;

const styles = StyleSheet.create({
  formSection: {
    marginBottom: 15,
  },
});
