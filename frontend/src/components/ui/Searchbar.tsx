import React, { ReactNode } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Feather } from '@expo/vector-icons';

export interface SearchbarProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onClearIconPress?: () => void;
  style?: any;
  inputStyle?: any;
  icon?: ReactNode;
  clearIcon?: ReactNode;
  showClearIcon?: boolean;
  elevation?: number;
}

export function Searchbar({
  placeholder = 'Search',
  value,
  onChangeText,
  onSubmitEditing,
  onClearIconPress,
  style,
  inputStyle,
  icon,
  clearIcon,
  showClearIcon = true,
  elevation = 1,
  ...props
}: SearchbarProps) {
  const { theme } = useAppTheme();

  const handleClear = () => {
    onChangeText('');
    if (onClearIconPress) {
      onClearIconPress();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          shadowColor: theme.colors.shadow,
          shadowOffset: { width: 0, height: elevation },
          shadowOpacity: 0.1 + elevation * 0.05,
          shadowRadius: elevation * 2,
          elevation: elevation,
        },
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        {icon || <Feather name="search" size={20} color={theme.colors.onSurfaceVariant} />}
      </View>

      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.onSurface,
            backgroundColor: 'transparent',
          },
          inputStyle,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        selectionColor={theme.colors.primary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        returnKeyType="search"
        {...props}
      />

      {showClearIcon && value !== '' && (
        <TouchableOpacity style={styles.clearIcon} onPress={handleClear}>
          {clearIcon || <Feather name="x" size={18} color={theme.colors.onSurfaceVariant} />}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    margin: 8,
  },
  iconContainer: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearIcon: {
    padding: 10,
  },
});
