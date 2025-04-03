import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface DividerProps extends ViewProps {
  horizontal?: boolean;
}

export function Divider({ style, horizontal = false, ...props }: DividerProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        horizontal ? styles.horizontal : styles.vertical,
        { backgroundColor: theme.colors.outlineVariant },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  vertical: {
    height: 1,
    width: '100%',
    marginVertical: 8,
  },
  horizontal: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
});
