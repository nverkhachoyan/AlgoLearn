import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';

export interface TextProps extends RNTextProps {
  variant?: 'headline' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
}

export function Text({ style, variant = 'body', ...props }: TextProps) {
  const { theme } = useAppTheme();

  let variantStyle = {};

  switch (variant) {
    case 'headline':
      variantStyle = styles.headline;
      break;
    case 'title':
      variantStyle = styles.title;
      break;
    case 'subtitle':
      variantStyle = styles.subtitle;
      break;
    case 'body':
      variantStyle = styles.body;
      break;
    case 'caption':
      variantStyle = styles.caption;
      break;
    case 'label':
      variantStyle = styles.label;
      break;
  }

  return <RNText style={[{ color: theme.colors.onSurface }, variantStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  headline: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
    opacity: 0.8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
