import { View, StyleSheet } from 'react-native';
import React from 'react';
import Conditional from '@/src/components/Conditional';
import LabeledInput from '@/src/components/LabeledInput';
import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

interface BioSectionProps {
  bio: string;
  editMode: boolean;
  onBioChange?: (value: string) => void;
  isDark: boolean;
}

const BioSection = ({ bio, editMode, onBioChange, isDark }: BioSectionProps) => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.bioContainer, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
      <Text variant="subtitle" style={[styles.bioTitle, { color: colors.primary }]}>
        About
      </Text>

      <Conditional
        condition={editMode}
        renderTrue={() => (
          <LabeledInput
            label="Bio"
            icon="file-text"
            placeholder="Write a short bio about yourself"
            value={bio || ''}
            onChangeText={text => onBioChange && onBioChange(text)}
            multiline={true}
            numberOfLines={4}
            maxLength={140}
            scrollEnabled={true}
          />
        )}
        renderFalse={() => (
          <Text style={[styles.bio, { color: colors.onSurface }]}>{bio || 'No bio available'}</Text>
        )}
      />
    </View>
  );
};

export default BioSection;

const styles = StyleSheet.create({
  bioContainer: {
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
});
