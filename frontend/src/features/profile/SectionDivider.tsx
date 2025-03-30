import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import React from 'react';

interface SectionDividerProps {
  title: string;
  isDark: boolean;
  withMarginTop?: boolean;
}

const SectionDivider = ({ title, isDark, withMarginTop = false }: SectionDividerProps) => {
  const { colors } = useTheme();

  return (
    <>
      <View
        style={[
          styles.infoSeparator,
          { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' },
        ]}
      />
      <Text
        style={[styles.sectionTitle, { color: colors.primary, marginTop: withMarginTop ? 15 : 0 }]}
      >
        {title}
      </Text>
    </>
  );
};

export default SectionDivider;

const styles = StyleSheet.create({
  infoSeparator: {
    height: 1,
    width: '100%',
    marginVertical: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
});
