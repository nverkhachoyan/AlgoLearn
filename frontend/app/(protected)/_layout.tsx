import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/src/context/ThemeContext';

export default function ProtectedLayout() {
  const { theme } = useAppTheme();

  return (
    <SafeAreaView edges={['left', 'right']} style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
