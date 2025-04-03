import { StyleSheet, View } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';
import { Text } from '@/src/components/ui';
import { Feather } from '@expo/vector-icons';
import React from 'react';

type IconType = React.ComponentProps<typeof Feather>['name'];

export default function UserInfoRow({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: IconType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  const { theme } = useAppTheme();
  const { colors } = theme;
  const dark = theme.dark;

  return (
    <View style={styles.userInfoRow}>
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: highlight
              ? colors.primary + '20'
              : dark
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
          },
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={highlight ? colors.primary : colors.onSurfaceVariant}
        />
      </View>
      <View style={styles.infoContent}>
        <Text variant="caption" style={[styles.userInfoLabel, { color: colors.onSurfaceVariant }]}>
          {label}
        </Text>
        <Text style={[styles.userInfoText, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  userInfoLabel: {
    fontSize: 13,
  },
  userInfoText: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
});
