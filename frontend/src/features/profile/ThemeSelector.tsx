import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { USER_PROFILE_GRADIENTS } from '@/constants/Colors';

type GradientThemeKey = keyof typeof USER_PROFILE_GRADIENTS;

interface ThemeSelectorProps {
  currentTheme: GradientThemeKey;
  onThemeChange: (theme: GradientThemeKey) => void;
  isDark: boolean;
}

const ThemeSelector = ({ currentTheme, onThemeChange, isDark }: ThemeSelectorProps) => {
  const { colors } = useTheme();

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: 15 }]}>
        Theme Preference
      </Text>
      <View style={styles.themeOptions}>
        {Object.entries(USER_PROFILE_GRADIENTS).map(([key, theme]) => (
          <TouchableOpacity
            key={key}
            style={[styles.themeOption, currentTheme === key && styles.selectedThemeOption]}
            onPress={() => onThemeChange(key as GradientThemeKey)}
          >
            <LinearGradient
              colors={isDark ? (theme.dark as [string, string]) : (theme.light as [string, string])}
              style={styles.themePreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={[styles.themeOptionText, { color: colors.onSurface }]}>{theme.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default ThemeSelector;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
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
});
