import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Feather from '@expo/vector-icons/Feather';

interface ButtonProps {
  onPress: () => void;
  title?: string;
  icon?: {
    name: keyof typeof Feather.glyphMap;
    position: 'left' | 'right' | 'middle';
    size?: number;
    color?: string;
  };
  style?: 'solid' | 'regular' | 'light' | 'brands';
}

export default function Button(props: ButtonProps) {
  const { onPress, title = 'Save', icon } = props;

  const renderIcon = () => {
    if (!icon) return null;

    const { name, size = 20, color = 'white' } = icon;

    return (
      <Feather
        name={name}
        size={size}
        color={color}
        style={icon.position === 'left' ? styles.iconLeft : styles.iconRight}
      />
    );
  };

  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={[styles.text]}>{title}</Text>
      {props.icon && renderIcon()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  iconRight: {
    position: 'absolute',
    right: 15,
  },
  iconLeft: {
    position: 'absolute',
    left: 15,
  },
});
