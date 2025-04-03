import React, { ReactNode } from 'react';
import { View, TouchableOpacity, StyleSheet, Text as RNText } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface ChipProps {
  mode?: 'flat' | 'outlined';
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onClose?: () => void;
  style?: any;
  textStyle?: any;
  icon?: ReactNode;
  closeIcon?: ReactNode;
  children: string;
}

export function Chip({
  mode = 'flat',
  selected = false,
  disabled = false,
  onPress,
  onClose,
  style,
  textStyle,
  icon,
  closeIcon,
  children,
}: ChipProps) {
  const { theme } = useAppTheme();

  const backgroundColor = (() => {
    if (disabled) return theme.colors.surfaceDisabled;
    if (selected) return theme.colors.secondaryContainer;
    return mode === 'flat' ? theme.colors.surfaceVariant : 'transparent';
  })();

  const textColor = (() => {
    if (disabled) return theme.colors.onSurfaceDisabled;
    if (selected) return theme.colors.onSecondaryContainer;
    return theme.colors.onSurface;
  })();

  const borderColor = mode === 'outlined' ? theme.colors.outline : backgroundColor;

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled}
      onPress={onPress}
    >
      {icon && <View style={styles.icon}>{icon}</View>}

      <RNText style={[styles.text, { color: textColor }, textStyle]}>{children}</RNText>

      {onClose && (
        <TouchableOpacity style={styles.closeIcon} onPress={onClose} disabled={disabled}>
          {closeIcon || <CloseIcon color={textColor} />}
        </TouchableOpacity>
      )}
    </Container>
  );
}

// Simple X icon for closing
function CloseIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: 1,
          height: 10,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: 1,
          height: 10,
          backgroundColor: color,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 12,
    height: 32,
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
  closeIcon: {
    marginLeft: 8,
  },
});
