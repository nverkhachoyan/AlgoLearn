import React, { ReactNode } from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface SurfaceProps extends ViewProps {
  elevation?: number;
  children: ReactNode;
}

export function Surface({ style, elevation = 1, children, ...props }: SurfaceProps) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        styles.surface,
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
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: 4,
  },
});
