import React from 'react';
import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedInputTextProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedInputText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedInputTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <TextInput
      style={[
        { color, backgroundColor },
        type === 'default' ? inputStyles.default : undefined,
        type === 'title' ? inputStyles.title : undefined,
        type === 'defaultSemiBold' ? inputStyles.defaultSemiBold : undefined,
        type === 'subtitle' ? inputStyles.subtitle : undefined,
        type === 'link' ? inputStyles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const inputStyles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
});
