import React from 'react';
import {
  ActivityIndicator as RNActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface ActivityIndicatorProps {
  animating?: boolean;
  color?: string;
  size?: 'small' | 'large' | number;
  style?: ViewStyle;
  hidesWhenStopped?: boolean;
}

export function ActivityIndicator({
  animating = true,
  color,
  size = 'small',
  style,
  hidesWhenStopped = true,
}: ActivityIndicatorProps) {
  const { theme } = useAppTheme();

  const indicatorColor = color || theme.colors.primary;

  if (!animating && hidesWhenStopped) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <RNActivityIndicator animating={animating} color={indicatorColor} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
