import { View, StyleSheet } from 'react-native';
import { useAppTheme } from '@/src/context/ThemeContext';
import { ActivityIndicator } from '@/src/components/ui';

export const Spinning = () => {
  const { theme } = useAppTheme();
  const { colors } = theme;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="small" color={colors.onSurface} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 100,
  },
});
