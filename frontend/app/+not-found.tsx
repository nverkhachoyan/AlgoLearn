import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui';
import { useAppTheme } from '@/src/context/ThemeContext';

export default function NotFoundScreen() {
  const { theme } = useAppTheme();
  const isDark = theme.dark;

  return (
    <View>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#FFF' }]}>
        <Text variant="headline" style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>
          This screen doesn't exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
